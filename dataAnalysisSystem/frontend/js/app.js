const { createApp, ref, computed, watch, nextTick, onMounted } = Vue;

createApp({
    setup() {
        const isLoggedIn = ref(false);
        const currentUser = ref(null);
        const currentTab = ref('analysis');
        const currentTheme = ref('light');
        const isLoading = ref(false);
        const message = ref('');
        const messageType = ref('success');
        
        const token = ref(localStorage.getItem('token') || '');
        const loginForm = ref({ username: '', password: '' });
        
        const tabs = [
            { key: 'analysis', label: '数据分析', adminOnly: false },
            { key: 'data', label: '数据管理', adminOnly: false },
            { key: 'dimensions', label: '维度管理', adminOnly: true },
            { key: 'conversion', label: '度量换算', adminOnly: true },
            { key: 'users', label: '用户管理', adminOnly: true },
            { key: 'summary', label: '系统概览', adminOnly: false }
        ];
        
        const isAdmin = computed(() => currentUser.value?.role === 'admin');
        
        const options = ref({
            dimensions: [],
            categories: [],
            units: [],
            data_names: [],
            chart_types: [],
            aggregation_funcs: [],
            group_by_options: []
        });
        
        const analysisConfig = ref({
            filters: {
                dimension_unique_ids: [],
                start_date: '',
                end_date: '',
                category_names: []
            },
            aggregations: [{
                group_by: 'dimension_value',
                group_rule: '',
                aggregation_func: 'sum'
            }],
            target_unit: '',
            chart_type: 'line'
        });
        
        const useAggregation = ref(false);
        const analysisResult = ref(null);
        const chartInstance = ref(null);
        const chartRef = ref(null);
        
        const dataRecords = ref([]);
        const dataFilter = ref('');
        const showDataModal = ref(false);
        const showImportModal = ref(false);
        const dataForm = ref({
            data_name: '',
            dimension_unique_id: '',
            dimension_value: '',
            value: null,
            unit: '',
            data_date: '',
            category_name: ''
        });
        const selectedCsvFile = ref(null);
        const selectedJsonFile = ref(null);
        const importResult = ref(null);
        
        const dimensions = ref([]);
        const showDimensionModal = ref(false);
        const dimensionForm = ref({
            english_name: '',
            display_name: '',
            default_unit: '',
            description: ''
        });
        
        const conversionRules = ref([]);
        const showConversionModal = ref(false);
        const conversionForm = ref({
            name: '',
            source_unit: '',
            target_unit: '',
            expression: '',
            description: ''
        });
        const testForm = ref({
            source_unit: '',
            target_unit: '',
            value: null
        });
        const testResult = ref('');
        
        const users = ref([]);
        const showUserModal = ref(false);
        const userForm = ref({
            username: '',
            password: '',
            email: '',
            role: 'user'
        });
        
        const summary = ref(null);
        
        const apiBase = '';
        
        function showMessage(msg, type = 'success') {
            message.value = msg;
            messageType.value = type;
            setTimeout(() => {
                message.value = '';
            }, 3000);
        }
        
        async function apiRequest(url, options = {}) {
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };
            if (token.value) {
                headers['Authorization'] = `Bearer ${token.value}`;
            }
            
            const response = await fetch(apiBase + url, {
                ...options,
                headers
            });
            
            if (response.status === 401) {
                logout();
                throw new Error('未授权');
            }
            
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.detail || '请求失败');
            }
            return data;
        }
        
        async function login() {
            try {
                isLoading.value = true;
                const formData = new URLSearchParams();
                formData.append('username', loginForm.value.username);
                formData.append('password', loginForm.value.password);
                
                const response = await fetch(apiBase + '/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('用户名或密码错误');
                }
                
                const data = await response.json();
                token.value = data.access_token;
                currentUser.value = data.user;
                localStorage.setItem('token', token.value);
                isLoggedIn.value = true;
                
                await loadInitialData();
                showMessage('登录成功');
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                isLoading.value = false;
            }
        }
        
        function logout() {
            token.value = '';
            currentUser.value = null;
            isLoggedIn.value = false;
            localStorage.removeItem('token');
            loginForm.value = { username: '', password: '' };
        }
        
        async function checkAuth() {
            if (!token.value) {
                isLoggedIn.value = false;
                return;
            }
            
            try {
                const user = await apiRequest('/api/auth/me');
                currentUser.value = user;
                isLoggedIn.value = true;
                await loadInitialData();
            } catch {
                logout();
            }
        }
        
        async function loadInitialData() {
            await Promise.all([
                loadOptions(),
                loadSummary()
            ]);
            
            if (isAdmin.value) {
                await Promise.all([
                    loadDimensions(),
                    loadConversionRules(),
                    loadUsers()
                ]);
            }
            await loadData();
        }
        
        async function loadOptions() {
            try {
                options.value = await apiRequest('/api/analysis/available-options');
            } catch (error) {
                console.error('加载选项失败:', error);
            }
        }
        
        async function loadSummary() {
            try {
                summary.value = await apiRequest('/api/analysis/summary');
            } catch (error) {
                console.error('加载概览失败:', error);
            }
        }
        
        async function loadDimensions() {
            try {
                dimensions.value = await apiRequest('/api/dimensions/?include_inactive=true');
            } catch (error) {
                console.error('加载维度失败:', error);
            }
        }
        
        async function loadConversionRules() {
            try {
                conversionRules.value = await apiRequest('/api/conversion/?include_disabled=true');
            } catch (error) {
                console.error('加载换算规则失败:', error);
            }
        }
        
        async function loadUsers() {
            try {
                users.value = await apiRequest('/api/auth/users');
            } catch (error) {
                console.error('加载用户失败:', error);
            }
        }
        
        async function loadData() {
            try {
                let url = '/api/data/?limit=100';
                if (dataFilter.value) {
                    url += `&data_names=${encodeURIComponent(dataFilter.value)}`;
                }
                dataRecords.value = await apiRequest(url);
            } catch (error) {
                console.error('加载数据失败:', error);
            }
        }
        
        async function runAnalysis() {
            try {
                isLoading.value = true;
                
                const request = {
                    chart_type: analysisConfig.value.chart_type,
                    target_unit: analysisConfig.value.target_unit || null,
                    filters: {},
                    aggregations: useAggregation.value ? analysisConfig.value.aggregations : null
                };
                
                if (analysisConfig.value.filters.dimension_unique_ids?.length) {
                    request.filters.dimension_unique_ids = analysisConfig.value.filters.dimension_unique_ids;
                }
                if (analysisConfig.value.filters.start_date) {
                    request.filters.start_date = analysisConfig.value.filters.start_date + 'T00:00:00';
                }
                if (analysisConfig.value.filters.end_date) {
                    request.filters.end_date = analysisConfig.value.filters.end_date + 'T23:59:59';
                }
                if (analysisConfig.value.filters.category_names?.length) {
                    request.filters.category_names = analysisConfig.value.filters.category_names;
                }
                
                const result = await apiRequest('/api/analysis/', {
                    method: 'POST',
                    body: JSON.stringify(request)
                });
                
                analysisResult.value = result;
                
                await nextTick();
                if (result.chart_data && analysisConfig.value.chart_type !== 'table') {
                    renderChart(result.chart_data);
                }
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                isLoading.value = false;
            }
        }
        
        function renderChart(chartData) {
            if (!chartRef.value) return;
            
            if (chartInstance.value) {
                chartInstance.value.dispose();
            }
            
            chartInstance.value = echarts.init(chartRef.value);
            
            let option = {};
            const isDark = currentTheme.value === 'dark';
            
            if (chartData.chart_type === 'pie') {
                option = {
                    tooltip: { trigger: 'item' },
                    legend: {
                        bottom: '5%',
                        textStyle: { color: isDark ? '#ccc' : '#333' }
                    },
                    series: [{
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: isDark ? '#1a1a2e' : '#fff',
                            borderWidth: 2
                        },
                        label: {
                            show: true,
                            color: isDark ? '#ccc' : '#333'
                        },
                        data: chartData.categories?.map((cat, i) => ({
                            name: cat,
                            value: chartData.values?.[i] || 0
                        })) || []
                    }],
                    animationDuration: 1000,
                    animationEasing: 'cubicOut'
                };
            } else {
                option = {
                    tooltip: { trigger: 'axis' },
                    legend: {
                        data: chartData.series?.map(s => s.name) || [],
                        textStyle: { color: isDark ? '#ccc' : '#333' }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: chartData.x_axis || [],
                        axisLabel: { color: isDark ? '#ccc' : '#666' }
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: { color: isDark ? '#ccc' : '#666' }
                    },
                    series: chartData.series?.map(s => ({
                        name: s.name,
                        type: chartData.chart_type,
                        data: s.data,
                        smooth: chartData.chart_type === 'line',
                        animationDuration: 1000,
                        animationEasing: 'cubicOut',
                        itemStyle: {
                            borderRadius: chartData.chart_type === 'bar' ? [8, 8, 0, 0] : 0
                        }
                    })) || []
                };
            }
            
            chartInstance.value.setOption(option);
            
            window.addEventListener('resize', () => {
                chartInstance.value?.resize();
            });
        }
        
        async function createDataRecord() {
            try {
                const data = {
                    ...dataForm.value,
                    data_date: dataForm.value.data_date + 'T00:00:00'
                };
                await apiRequest('/api/data/', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                showDataModal.value = false;
                dataForm.value = {
                    data_name: '',
                    dimension_unique_id: '',
                    dimension_value: '',
                    value: null,
                    unit: '',
                    data_date: '',
                    category_name: ''
                };
                await loadData();
                await loadOptions();
                await loadSummary();
                showMessage('数据添加成功');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        }
        
        async function deleteRecord(id) {
            if (!confirm('确定要删除这条数据吗？')) return;
            try {
                await apiRequest(`/api/data/${id}`, { method: 'DELETE' });
                await loadData();
                await loadSummary();
                showMessage('删除成功');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        }
        
        function handleCsvSelect(e) {
            selectedCsvFile.value = e.target.files[0];
        }
        
        function handleJsonSelect(e) {
            selectedJsonFile.value = e.target.files[0];
        }
        
        async function importCsv() {
            if (!selectedCsvFile.value) return;
            try {
                isLoading.value = true;
                const formData = new FormData();
                formData.append('file', selectedCsvFile.value);
                
                const headers = {
                    'Authorization': `Bearer ${token.value}`
                };
                
                const response = await fetch(apiBase + '/api/data/import/csv', {
                    method: 'POST',
                    headers,
                    body: formData
                });
                
                importResult.value = await response.json();
                await loadData();
                await loadOptions();
                await loadSummary();
                showMessage('导入完成');
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                isLoading.value = false;
            }
        }
        
        async function importJson() {
            if (!selectedJsonFile.value) return;
            try {
                isLoading.value = true;
                const formData = new FormData();
                formData.append('file', selectedJsonFile.value);
                
                const headers = {
                    'Authorization': `Bearer ${token.value}`
                };
                
                const response = await fetch(apiBase + '/api/data/import/json', {
                    method: 'POST',
                    headers,
                    body: formData
                });
                
                importResult.value = await response.json();
                await loadData();
                await loadOptions();
                await loadSummary();
                showMessage('导入完成');
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                isLoading.value = false;
            }
        }
        
        async function createDimension() {
            try {
                await apiRequest('/api/dimensions/', {
                    method: 'POST',
                    body: JSON.stringify(dimensionForm.value)
                });
                showDimensionModal.value = false;
                dimensionForm.value = {
                    english_name: '',
                    display_name: '',
                    default_unit: '',
                    description: ''
                };
                await loadDimensions();
                await loadOptions();
                await loadSummary();
                showMessage('维度创建成功');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        }
        
        async function toggleDimension(dim) {
            try {
                await apiRequest(`/api/dimensions/${dim.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ is_active: !dim.is_active })
                });
                await loadDimensions();
                await loadOptions();
                showMessage('状态已更新');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        }
        
        async function deleteDimension(id) {
            if (!confirm('确定要删除这个维度吗？')) return;
            try {
                await apiRequest(`/api/dimensions/${id}`, { method: 'DELETE' });
                await loadDimensions();
                await loadOptions();
                await loadSummary();
                showMessage('删除成功');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        }
        
        async function createConversionRule() {
            try {
                await apiRequest('/api/conversion/', {
                    method: 'POST',
                    body: JSON.stringify(conversionForm.value)
                });
                showConversionModal.value = false;
                conversionForm.value = {
                    name: '',
                    source_unit: '',
                    target_unit: '',
                    expression: '',
                    description: ''
                };
                await loadConversionRules();
                await loadOptions();
                showMessage('规则创建成功');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        }
        
        async function toggleRule(rule) {
            try {
                await apiRequest(`/api/conversion/${rule.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ is_enabled: !rule.is_enabled })
                });
                await loadConversionRules();
                await loadOptions();
                showMessage('状态已更新');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        }
        
        async function deleteRule(id) {
            if (!confirm('确定要删除这个规则吗？')) return;
            try {
                await apiRequest(`/api/conversion/${id}`, { method: 'DELETE' });
                await loadConversionRules();
                await loadOptions();
                showMessage('删除成功');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        }
        
        async function testConversion() {
            if (!testForm.value.source_unit || !testForm.value.target_unit || testForm.value.value === null) {
                showMessage('请填写完整信息', 'error');
                return;
            }
            try {
                const result = await apiRequest(
                    `/api/conversion/test?source_unit=${encodeURIComponent(testForm.value.source_unit)}&target_unit=${encodeURIComponent(testForm.value.target_unit)}&value=${testForm.value.value}`,
                    { method: 'POST' }
                );
                testResult.value = `${result.original_value} ${result.source_unit} = ${result.converted_value} ${result.target_unit}`;
            } catch (error) {
                showMessage(error.message, 'error');
            }
        }
        
        async function createUser() {
            try {
                await apiRequest('/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(userForm.value)
                });
                showUserModal.value = false;
                userForm.value = {
                    username: '',
                    password: '',
                    email: '',
                    role: 'user'
                };
                await loadUsers();
                showMessage('用户创建成功');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        }
        
        async function toggleUser(userId) {
            try {
                await apiRequest(`/api/auth/users/${userId}/toggle`, { method: 'PUT' });
                await loadUsers();
                showMessage('状态已更新');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        }
        
        function applyTheme() {
            document.documentElement.setAttribute('data-theme', currentTheme.value);
            localStorage.setItem('theme', currentTheme.value);
            if (analysisResult.value && chartInstance.value) {
                renderChart(analysisResult.value.chart_data);
            }
        }
        
        function formatDate(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('zh-CN');
        }
        
        watch(currentTab, (newTab) => {
            if (newTab === 'data') loadData();
            if (newTab === 'summary') loadSummary();
            if (newTab === 'dimensions' && isAdmin.value) loadDimensions();
            if (newTab === 'conversion' && isAdmin.value) loadConversionRules();
            if (newTab === 'users' && isAdmin.value) loadUsers();
        });
        
        onMounted(() => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                currentTheme.value = savedTheme;
                applyTheme();
            }
            checkAuth();
        });
        
        return {
            isLoggedIn,
            currentUser,
            currentTab,
            currentTheme,
            isLoading,
            message,
            messageType,
            loginForm,
            tabs,
            isAdmin,
            options,
            analysisConfig,
            useAggregation,
            analysisResult,
            chartRef,
            dataRecords,
            dataFilter,
            showDataModal,
            showImportModal,
            dataForm,
            importResult,
            dimensions,
            showDimensionModal,
            dimensionForm,
            conversionRules,
            showConversionModal,
            conversionForm,
            testForm,
            testResult,
            users,
            showUserModal,
            userForm,
            summary,
            login,
            logout,
            applyTheme,
            runAnalysis,
            loadData,
            createDataRecord,
            deleteRecord,
            handleCsvSelect,
            handleJsonSelect,
            importCsv,
            importJson,
            createDimension,
            toggleDimension,
            deleteDimension,
            createConversionRule,
            toggleRule,
            deleteRule,
            testConversion,
            createUser,
            toggleUser,
            formatDate
        };
    }
}).mount('#app');
