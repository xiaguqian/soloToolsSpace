CREATE DATABASE IF NOT EXISTS xunfood DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE xunfood;

CREATE TABLE IF NOT EXISTS user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    phone VARCHAR(20) UNIQUE COMMENT '手机号',
    username VARCHAR(50) COMMENT '用户名',
    nickname VARCHAR(50) COMMENT '昵称',
    password VARCHAR(255) COMMENT '密码',
    avatar VARCHAR(255) COMMENT '头像',
    bio VARCHAR(500) COMMENT '简介',
    recipe_count INT DEFAULT 0 COMMENT '发布菜谱数',
    like_count INT DEFAULT 0 COMMENT '获得点赞数',
    favorite_count INT DEFAULT 0 COMMENT '获得收藏数',
    follower_count INT DEFAULT 0 COMMENT '粉丝数',
    following_count INT DEFAULT 0 COMMENT '关注数',
    level TINYINT DEFAULT 0 COMMENT '用户等级：0-十指不沾阳春水 1-家庭掌勺人 2-厨神',
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS recipe (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '菜谱ID',
    user_id BIGINT NOT NULL COMMENT '作者ID',
    title VARCHAR(100) NOT NULL COMMENT '菜谱标题',
    description VARCHAR(500) COMMENT '简介',
    cover VARCHAR(255) COMMENT '封面图',
    difficulty TINYINT DEFAULT 1 COMMENT '难度：1-简单 2-中等 3-困难',
    cook_time INT DEFAULT 30 COMMENT '烹饪时间(分钟)',
    serving INT DEFAULT 2 COMMENT '份量',
    ingredients TEXT COMMENT '食材列表(JSON)',
    steps TEXT COMMENT '步骤列表(JSON)',
    media TEXT COMMENT '媒体列表(JSON)',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    favorite_count INT DEFAULT 0 COMMENT '收藏数',
    view_count INT DEFAULT 0 COMMENT '浏览数',
    status TINYINT DEFAULT 1 COMMENT '状态：0-隐藏 1-公开',
    deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_like_count (like_count),
    INDEX idx_favorite_count (favorite_count),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜谱表';

CREATE TABLE IF NOT EXISTS user_like (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    recipe_id BIGINT NOT NULL COMMENT '菜谱ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_recipe (user_id, recipe_id),
    INDEX idx_recipe_id (recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞表';

CREATE TABLE IF NOT EXISTS user_favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    recipe_id BIGINT NOT NULL COMMENT '菜谱ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_recipe (user_id, recipe_id),
    INDEX idx_recipe_id (recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

CREATE TABLE IF NOT EXISTS user_follow (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    follower_id BIGINT NOT NULL COMMENT '关注者ID',
    following_id BIGINT NOT NULL COMMENT '被关注者ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_follower_following (follower_id, following_id),
    INDEX idx_following_id (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注表';

-- ==================== 测试数据 ====================

-- 用户数据
INSERT IGNORE INTO user (id, phone, username, nickname, password, avatar, bio, recipe_count, like_count, favorite_count, follower_count, following_count, level, deleted) VALUES
(1, '13800138001', 'chef_wang', '厨神小王', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E5%8F%AF%E7%88%B1%E7%94%B7%E7%94%9F%E5%A4%B4%E5%83%8F%20%E5%8D%A1%E9%80%9A%E9%A3%8E%E6%A0%BC&image_size=square', '热爱美食，热爱生活，十年厨艺经验', 8, 156, 89, 234, 12, 2, 0),
(2, '13800138002', 'xiaomei', '美食家小美', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E5%8F%AF%E7%88%B1%E5%A5%B3%E7%94%9F%E5%A4%B4%E5%83%8F%20%E5%8D%A1%E9%80%9A%E9%A3%8E%E6%A0%BC&image_size=square', '喜欢烘焙和甜点制作', 6, 87, 56, 156, 8, 1, 0),
(3, '13800138003', 'laoli', '老李家常菜', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E4%B8%AD%E5%B9%B4%E7%94%B7%E5%A3%AB%E5%A4%B4%E5%83%8F%20%E6%B8%A9%E6%96%87%E5%8F%AF%E7%88%B1&image_size=square', '地道家常菜，妈妈的味道', 5, 234, 178, 567, 23, 2, 0),
(4, '13800138004', 'xiaoxin', '新手小欣', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E5%B9%B4%E8%BD%BB%E5%A5%B3%E5%AD%A9%E5%A4%B4%E5%83%8F%20%E6%96%B0%E6%89%8B&image_size=square', '刚开始学做菜，请多多指教', 0, 0, 0, 12, 34, 0, 0);

-- 密码统一为: 123456

-- 菜谱数据
INSERT IGNORE INTO recipe (id, user_id, title, description, cover, difficulty, cook_time, serving, ingredients, steps, media, like_count, favorite_count, view_count, status, deleted) VALUES
(1, 1, '经典红烧肉', '肥而不腻，入口即化的家常红烧肉，是待客的硬菜首选', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E7%BA%A2%E7%83%A7%E8%82%89%20%E7%BE%8E%E9%A3%9F%E6%91%84%E5%BD%B1%20%E9%AB%98%E6%B8%85&image_size=square_hd', 2, 90, 4,
'[{"name":"五花肉","amount":"500g"},{"name":"冰糖","amount":"30g"},{"name":"生抽","amount":"2勺"},{"name":"老抽","amount":"1勺"},{"name":"料酒","amount":"2勺"},{"name":"姜片","amount":"5片"},{"name":"八角","amount":"2个"},{"name":"桂皮","amount":"1小块"}]',
'[{"order":1,"description":"五花肉切成2厘米见方的块，清洗干净"},{"order":2,"description":"冷水下锅，加入姜片和料酒，大火烧开焯水5分钟，撇去浮沫后捞出沥干"},{"order":3,"description":"锅中放少许油，放入冰糖小火慢慢炒出糖色"},{"order":4,"description":"放入焯好水的五花肉，翻炒均匀上色"},{"order":5,"description":"加入生抽、老抽、料酒、八角、桂皮，翻炒出香味"},{"order":6,"description":"加入没过肉的开水，大火烧开后转小火慢炖60分钟"},{"order":7,"description":"开大火收汁，汤汁浓稠后即可出锅"}]',
NULL, 156, 89, 2345, 1, 0),

(2, 1, '糖醋排骨', '酸甜可口，外酥里嫩的经典糖醋排骨，孩子们的最爱', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E7%B3%96%E9%86%8B%E6%8E%92%E9%AA%A8%20%E7%BE%8E%E9%A3%9F%E6%91%84%E5%BD%B1%20%E9%AB%98%E6%B8%85&image_size=square_hd', 2, 60, 3,
'[{"name":"猪小排","amount":"400g"},{"name":"白糖","amount":"3勺"},{"name":"白醋","amount":"2勺"},{"name":"生抽","amount":"1勺"},{"name":"料酒","amount":"1勺"},{"name":"番茄酱","amount":"2勺"},{"name":"淀粉","amount":"适量"},{"name":"白芝麻","amount":"少许"}]',
'[{"order":1,"description":"排骨剁成小段，用清水浸泡30分钟去除血水"},{"order":2,"description":"加入料酒、生抽腌制20分钟"},{"order":3,"description":"腌制好的排骨裹上一层干淀粉"},{"order":4,"description":"锅中倒油，油温六成热时放入排骨，中小火炸至金黄酥脆捞出"},{"order":5,"description":"锅中留少许油，放入白糖小火炒化"},{"order":6,"description":"加入白醋、生抽、番茄酱，调成糖醋汁"},{"order":7,"description":"放入炸好的排骨，快速翻炒均匀，撒上白芝麻出锅"}]',
NULL, 98, 67, 1567, 1, 0),

(3, 2, '戚风蛋糕', '松软蓬松，口感细腻的基础戚风蛋糕，烘焙入门必学', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E6%88%9A%E9%A3%8E%E8%9B%8B%E7%B3%95%20%E7%94%9C%E7%82%B9%20%E7%BE%8E%E9%A3%9F%E6%91%84%E5%BD%B1&image_size=square_hd', 3, 80, 8,
'[{"name":"鸡蛋","amount":"5个"},{"name":"低筋面粉","amount":"85g"},{"name":"细砂糖","amount":"80g(蛋白60g+蛋黄20g)"},{"name":"纯牛奶","amount":"50ml"},{"name":"玉米油","amount":"50ml"},{"name":"柠檬汁","amount":"几滴"}]',
'[{"order":1,"description":"分离蛋白和蛋黄，蛋白放入无油无水的盆中"},{"order":2,"description":"蛋黄中加入20g细砂糖、牛奶、玉米油，搅拌均匀"},{"order":3,"description":"筛入低筋面粉，用Z字形搅拌至无颗粒"},{"order":4,"description":"蛋白中加几滴柠檬汁，分三次加入60g细砂糖，打至硬性发泡（提起有小尖钩）"},{"order":5,"description":"取1/3蛋白霜到蛋黄糊中，翻拌均匀"},{"order":6,"description":"倒回剩下的蛋白霜中，继续翻拌均匀"},{"order":7,"description":"倒入6寸模具，轻震几下震出大气泡"},{"order":8,"description":"烤箱预热150度，中下层烤50-60分钟"},{"order":9,"description":"出炉立即倒扣，完全冷却后脱模"}]',
NULL, 234, 178, 4567, 1, 0),

(4, 2, '芒果班戟', '外皮Q弹，内馅香甜，满满的芒果果肉', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E8%8A%92%E6%9E%9C%E7%8F%AD%E6%88%9F%20%E9%A6%99%E6%B8%AF%E7%94%9C%E5%93%81%20%E7%BE%8E%E9%A3%9F%E6%91%84%E5%BD%B1&image_size=square_hd', 2, 40, 6,
'[{"name":"低筋面粉","amount":"60g"},{"name":"鸡蛋","amount":"2个"},{"name":"牛奶","amount":"180ml"},{"name":"细砂糖","amount":"30g"},{"name":"黄油","amount":"15g"},{"name":"淡奶油","amount":"200ml"},{"name":"细砂糖(奶油)","amount":"20g"},{"name":"芒果","amount":"2个"}]',
'[{"order":1,"description":"鸡蛋打散，加入细砂糖、牛奶混合均匀"},{"order":2,"description":"筛入低筋面粉，搅拌至无颗粒"},{"order":3,"description":"加入融化的黄油，搅拌均匀后静置20分钟"},{"order":4,"description":"平底锅小火加热，舀一勺面糊摊成薄饼，两面微黄即可"},{"order":5,"description":"淡奶油加20g细砂糖，打发至硬性发泡"},{"order":6,"description":"芒果切小块备用"},{"order":7,"description":"饼皮中间放一勺奶油，放几块芒果，再盖一层奶油，包成四方形即可"}]',
NULL, 123, 89, 2345, 1, 0),

(5, 3, '番茄炒蛋', '最简单也最考验功底的家常菜，酸甜可口', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E7%95%AA%E8%8C%84%E7%82%92%E8%9B%8B%20%E5%AE%B6%E5%B8%B8%E8%8F%9C%20%E7%BE%8E%E9%A3%9F%E6%91%84%E5%BD%B1&image_size=square_hd', 1, 15, 2,
'[{"name":"番茄","amount":"2个"},{"name":"鸡蛋","amount":"3个"},{"name":"葱花","amount":"适量"},{"name":"盐","amount":"适量"},{"name":"白糖","amount":"1小勺"}]',
'[{"order":1,"description":"番茄顶部划十字，用开水烫一下，去皮切块"},{"order":2,"description":"鸡蛋打散，加少许盐搅匀"},{"order":3,"description":"锅中倒油烧热，倒入蛋液，快速翻炒至凝固盛出"},{"order":4,"description":"锅中再倒油，放入番茄块翻炒出汁"},{"order":5,"description":"加少许白糖和盐调味，炒至番茄软烂"},{"order":6,"description":"倒入炒好的鸡蛋，翻炒均匀，撒上葱花出锅"}]',
NULL, 189, 123, 3456, 1, 0),

(6, 3, '酸辣土豆丝', '爽脆可口，酸辣开胃的下饭菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E9%85%B8%E8%BE%A3%E5%9C%9F%E8%B1%86%E4%B8%9D%20%E5%AE%B6%E5%B8%B8%E8%8F%9C%20%E4%B8%8B%E9%A5%AD%E8%8F%9C&image_size=square_hd', 1, 20, 3,
'[{"name":"土豆","amount":"2个"},{"name":"干辣椒","amount":"5个"},{"name":"花椒","amount":"少许"},{"name":"白醋","amount":"2勺"},{"name":"盐","amount":"适量"},{"name":"生抽","amount":"1勺"}]',
'[{"order":1,"description":"土豆去皮切成均匀的细丝，用清水浸泡去除淀粉"},{"order":2,"description":"锅中烧水，水开后下土豆丝焯水30秒，捞出过凉水沥干"},{"order":3,"description":"锅中倒油烧热，放入花椒、干辣椒爆香"},{"order":4,"description":"放入土豆丝大火快速翻炒"},{"order":5,"description":"加入白醋、盐、生抽调味，翻炒均匀出锅"}]',
NULL, 167, 98, 2890, 1, 0),

(7, 3, '清炒时蔬', '健康清淡的绿叶蔬菜，保留食材本味', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E6%B8%85%E7%82%92%E6%97%B6%E8%8E%A6%20%E7%BB%BF%E8%8F%9C%20%E5%81%A5%E5%BA%B7%E9%A4%90&image_size=square_hd', 1, 10, 2,
'[{"name":"青菜","amount":"一把"},{"name":"蒜末","amount":"适量"},{"name":"盐","amount":"适量"}]',
'[{"order":1,"description":"青菜清洗干净，沥干水分"},{"order":2,"description":"锅中倒油烧热，放入蒜末爆香"},{"order":3,"description":"放入青菜大火快速翻炒"},{"order":4,"description":"加少许盐调味，翻炒均匀即可出锅"}]',
NULL, 89, 56, 1234, 1, 0),

(8, 1, '宫保鸡丁', '川菜经典，鸡肉滑嫩，花生酥脆', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E5%AE%AB%E4%BF%9D%E9%B8%A1%E4%B8%81%20%E5%B7%9D%E8%8F%9C%20%E9%BA%BB%E8%BE%A3%E9%A6%99&image_size=square_hd', 2, 30, 3,
'[{"name":"鸡胸肉","amount":"300g"},{"name":"花生米","amount":"50g"},{"name":"干辣椒","amount":"10个"},{"name":"花椒","amount":"1勺"},{"name":"葱姜蒜","amount":"适量"},{"name":"生抽","amount":"2勺"},{"name":"陈醋","amount":"1勺"},{"name":"白糖","amount":"1勺"},{"name":"淀粉","amount":"适量"}]',
'[{"order":1,"description":"鸡胸肉切丁，加盐、生抽、淀粉腌制15分钟"},{"order":2,"description":"调碗汁：生抽、陈醋、白糖、淀粉、少许水搅匀"},{"order":3,"description":"花生米用凉油小火炸至金黄酥脆"},{"order":4,"description":"锅中倒油，滑炒鸡丁至变色盛出"},{"order":5,"description":"锅中留油，爆香干辣椒、花椒、葱姜蒜"},{"order":6,"description":"倒入鸡丁快速翻炒，淋入碗汁"},{"order":7,"description":"最后加入花生米翻炒均匀出锅"}]',
NULL, 234, 156, 4567, 1, 0),

(9, 1, '清蒸鲈鱼', '鲜嫩多汁，原汁原味，宴客必备', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E6%B8%85%E8%92%B8%E9%B2%A8%E9%B1%BC%20%E6%B1%87%E8%8F%9C%20%E9%B2%9C%E5%AB%A9%E5%8F%AF%E5%8F%A3&image_size=square_hd', 2, 25, 2,
'[{"name":"鲈鱼","amount":"1条(约500g)"},{"name":"葱姜丝","amount":"适量"},{"name":"蒸鱼豉油","amount":"2勺"},{"name":"料酒","amount":"1勺"},{"name":"盐","amount":"少许"}]',
'[{"order":1,"description":"鲈鱼处理干净，两面划几刀，用盐和料酒腌制10分钟"},{"order":2,"description":"鱼身和鱼腹放上葱姜丝"},{"order":3,"description":"水开后放入鱼，大火蒸8-10分钟"},{"order":4,"description":"蒸好后倒掉盘中的水，去掉旧葱姜"},{"order":5,"description":"铺上新鲜的葱姜丝，淋上蒸鱼豉油"},{"order":6,"description":"锅中烧热油，淋在葱姜丝上激出香味"}]',
NULL, 189, 134, 3456, 1, 0),

(10, 2, '提拉米苏', '意式经典甜点，浓郁咖啡香与奶香的完美结合', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E6%8F%90%E6%8B%89%E7%B1%B3%E8%8B%8F%20%E6%84%8F%E5%BC%8F%E7%94%9C%E7%82%B9%20%E5%92%96%E5%95%A1%E5%8E%9F%E5%91%B3&image_size=square_hd', 3, 60, 6,
'[{"name":"马斯卡彭奶酪","amount":"250g"},{"name":"淡奶油","amount":"150ml"},{"name":"细砂糖","amount":"60g"},{"name":"鸡蛋","amount":"2个"},{"name":"手指饼干","amount":"200g"},{"name":"浓缩咖啡","amount":"200ml"},{"name":"可可粉","amount":"适量"},{"name":"朗姆酒","amount":"1勺"}]',
'[{"order":1,"description":"蛋黄加30g糖，隔水加热打发至浓稠发白"},{"order":2,"description":"马斯卡彭奶酪搅拌顺滑，加入蛋黄糊拌匀"},{"order":3,"description":"淡奶油加30g糖打发至7分发，与奶酪糊混合"},{"order":4,"description":"浓缩咖啡放凉，加入朗姆酒"},{"order":5,"description":"手指饼干快速蘸取咖啡液，铺在容器底部"},{"order":6,"description":"铺一层奶酪糊，再铺一层蘸过咖啡的饼干"},{"order":7,"description":"重复铺层，最后一层是奶酪糊，表面抹平"},{"order":8,"description":"冷藏4小时以上，食用前筛上可可粉"}]',
NULL, 267, 189, 5678, 1, 0),

(11, 1, '麻婆豆腐', '麻辣鲜香，豆腐嫩滑，米饭杀手', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E9%BA%BB%E5%A9%86%E8%B1%86%E8%85%90%20%E5%B7%9D%E8%8F%9C%20%E9%BA%BB%E8%BE%A3%E9%A6%99&image_size=square_hd', 2, 25, 2,
'[{"name":"嫩豆腐","amount":"1块"},{"name":"牛肉末","amount":"100g"},{"name":"豆瓣酱","amount":"1勺"},{"name":"豆豉","amount":"1勺"},{"name":"花椒粉","amount":"1小勺"},{"name":"蒜末","amount":"适量"},{"name":"淀粉水","amount":"适量"}]',
'[{"order":1,"description":"豆腐切小块，用盐水浸泡5分钟，沥干备用"},{"order":2,"description":"锅中倒油，放入牛肉末炒至变色"},{"order":3,"description":"加入豆瓣酱、豆豉、蒜末炒出红油"},{"order":4,"description":"加入适量清水烧开，放入豆腐块"},{"order":5,"description":"小火煮5分钟，让豆腐入味"},{"order":6,"description":"淋入淀粉水勾芡，撒上花椒粉出锅"}]',
NULL, 178, 123, 3567, 1, 0),

(12, 3, '蛋炒饭', '粒粒分明，金黄诱人的经典炒饭', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E8%9B%8B%E7%82%92%E9%A5%AD%20%E7%B2%92%E7%B2%92%E5%88%86%E6%98%8E%20%E9%87%91%E9%BB%84%E8%AF%B1%E4%BA%BA&image_size=square_hd', 1, 15, 2,
'[{"name":"隔夜米饭","amount":"1碗"},{"name":"鸡蛋","amount":"2个"},{"name":"葱花","amount":"适量"},{"name":"盐","amount":"适量"},{"name":"生抽","amount":"少许"}]',
'[{"order":1,"description":"鸡蛋打散，米饭提前用手抓散"},{"order":2,"description":"锅中多倒些油，烧热后倒入蛋液"},{"order":3,"description":"蛋液刚凝固时立即倒入米饭快速翻炒"},{"order":4,"description":"让每粒米饭都裹上蛋液"},{"order":5,"description":"加盐和少许生抽调味"},{"order":6,"description":"大火翻炒均匀，撒葱花出锅"}]',
NULL, 145, 89, 2678, 1, 0);

-- 点赞关系
INSERT IGNORE INTO user_like (user_id, recipe_id) VALUES
(1, 3), (1, 5), (1, 6),
(2, 1), (2, 5), (2, 8), (2, 9),
(3, 3), (3, 4),
(4, 1), (4, 2), (4, 3), (4, 5), (4, 6), (4, 7), (4, 8), (4, 9), (4, 10), (4, 11);

-- 收藏关系
INSERT IGNORE INTO user_favorite (user_id, recipe_id) VALUES
(1, 3), (1, 10),
(2, 1), (2, 5), (2, 8),
(4, 1), (4, 2), (4, 3), (4, 5), (4, 6), (4, 8), (4, 9), (4, 10), (4, 11);

-- 关注关系
INSERT IGNORE INTO user_follow (follower_id, following_id) VALUES
(2, 1), (3, 1), (4, 1),
(1, 3), (4, 2),
(4, 3);

