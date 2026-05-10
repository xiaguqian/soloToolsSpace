package com.task.service;

import com.task.entity.Task;
import com.task.repository.TaskRepository;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private Scheduler scheduler;

    public Optional<Task> findById(Long id) {
        return taskRepository.findById(id);
    }

    public Optional<Task> findByJobId(String jobId) {
        return taskRepository.findByJobId(jobId);
    }

    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    @Transactional
    public Task save(Task task) {
        return taskRepository.save(task);
    }

    @Transactional
    public Task create(Task task, String username) {
        if (taskRepository.existsByJobId(task.getJobId())) {
            throw new RuntimeException("任务ID已存在");
        }
        task.setCreateBy(username);
        task.setStatus(Task.TaskStatus.STOPPED);
        return taskRepository.save(task);
    }

    @Transactional
    public Task update(Long id, Task taskDetails) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("任务不存在"));

        if (task.getStatus() == Task.TaskStatus.RUNNING) {
            throw new RuntimeException("运行中的任务无法修改，请先停止任务");
        }

        if (taskDetails.getJobName() != null) {
            task.setJobName(taskDetails.getJobName());
        }
        if (taskDetails.getTaskType() != null) {
            task.setTaskType(taskDetails.getTaskType());
        }
        if (taskDetails.getCronExpression() != null) {
            task.setCronExpression(taskDetails.getCronExpression());
        }
        if (taskDetails.getScheduleType() != null) {
            task.setScheduleType(taskDetails.getScheduleType());
        }
        if (taskDetails.getFixedRate() != null) {
            task.setFixedRate(taskDetails.getFixedRate());
        }
        if (taskDetails.getFixedDelay() != null) {
            task.setFixedDelay(taskDetails.getFixedDelay());
        }
        if (taskDetails.getCommandDetail() != null) {
            task.setCommandDetail(taskDetails.getCommandDetail());
        }
        if (taskDetails.getParameters() != null) {
            task.setParameters(taskDetails.getParameters());
        }
        if (taskDetails.getTimeoutSeconds() != null) {
            task.setTimeoutSeconds(taskDetails.getTimeoutSeconds());
        }
        if (taskDetails.getDescription() != null) {
            task.setDescription(taskDetails.getDescription());
        }
        if (taskDetails.getEnabled() != null) {
            task.setEnabled(taskDetails.getEnabled());
        }

        return taskRepository.save(task);
    }

    @Transactional
    public void delete(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("任务不存在"));

        if (task.getStatus() == Task.TaskStatus.RUNNING) {
            stopTask(task.getId());
        }

        taskRepository.deleteById(id);
    }

    @Transactional
    public Task startTask(Long id) throws SchedulerException {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("任务不存在"));

        if (task.getStatus() == Task.TaskStatus.RUNNING) {
            return task;
        }

        if (!task.getEnabled()) {
            throw new RuntimeException("任务已被禁用，无法启动");
        }

        scheduleTask(task);
        task.setStatus(Task.TaskStatus.RUNNING);
        return taskRepository.save(task);
    }

    @Transactional
    public Task stopTask(Long id) throws SchedulerException {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("任务不存在"));

        if (task.getStatus() == Task.TaskStatus.STOPPED) {
            return task;
        }

        unScheduleTask(task);
        task.setStatus(Task.TaskStatus.STOPPED);
        return taskRepository.save(task);
    }

    @Transactional
    public Task updateCron(Long id, String cronExpression) throws SchedulerException {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("任务不存在"));

        task.setCronExpression(cronExpression);

        if (task.getStatus() == Task.TaskStatus.RUNNING) {
            unScheduleTask(task);
            task.setCronExpression(cronExpression);
            scheduleTask(task);
        } else {
            task.setCronExpression(cronExpression);
        }

        return taskRepository.save(task);
    }

    private void scheduleTask(Task task) throws SchedulerException {
        JobDetail jobDetail = JobBuilder.newJob(TaskJob.class)
                .withIdentity(task.getJobId(), task.getJobGroup() != null ? task.getJobGroup() : "DEFAULT")
                .withDescription(task.getJobName())
                .storeDurably()
                .build();

        jobDetail.getJobDataMap().put("taskType", task.getTaskType().name());
        jobDetail.getJobDataMap().put("commandDetail", task.getCommandDetail());
        jobDetail.getJobDataMap().put("parameters", task.getParameters());
        jobDetail.getJobDataMap().put("timeoutSeconds", task.getTimeoutSeconds());

        Trigger trigger = buildTrigger(task);

        if (scheduler.checkExists(jobDetail.getKey())) {
            scheduler.addJob(jobDetail, true);
            scheduler.rescheduleJob(trigger.getKey(), trigger);
        } else {
            scheduler.scheduleJob(jobDetail, trigger);
        }
    }

    private Trigger buildTrigger(Task task) {
        TriggerBuilder<Trigger> triggerBuilder = TriggerBuilder.newTrigger()
                .withIdentity(task.getJobId() + "_trigger", 
                             task.getJobGroup() != null ? task.getJobGroup() : "DEFAULT")
                .withDescription(task.getDescription());

        switch (task.getScheduleType()) {
            case CRON:
                triggerBuilder.withSchedule(CronScheduleBuilder.cronSchedule(task.getCronExpression()));
                break;
            case FIXED_RATE:
                triggerBuilder.withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withIntervalInMilliseconds(task.getFixedRate() != null ? task.getFixedRate() : 60000)
                        .repeatForever());
                break;
            case FIXED_DELAY:
                triggerBuilder.withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withIntervalInMilliseconds(task.getFixedDelay() != null ? task.getFixedDelay() : 60000)
                        .repeatForever());
                break;
        }

        return triggerBuilder.build();
    }

    private void unScheduleTask(Task task) throws SchedulerException {
        TriggerKey triggerKey = TriggerKey.triggerKey(
                task.getJobId() + "_trigger",
                task.getJobGroup() != null ? task.getJobGroup() : "DEFAULT"
        );

        if (scheduler.checkExists(triggerKey)) {
            scheduler.unscheduleJob(triggerKey);
        }

        JobKey jobKey = JobKey.jobKey(
                task.getJobId(),
                task.getJobGroup() != null ? task.getJobGroup() : "DEFAULT"
        );

        if (scheduler.checkExists(jobKey)) {
            scheduler.deleteJob(jobKey);
        }
    }
}
