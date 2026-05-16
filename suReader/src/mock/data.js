export const getBooksMock = () => {
  return {
    success: true,
    data: [
      {
        id: '1',
        name: '斗破苍穹',
        author: '天蚕土豆',
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=novel%20book%20cover%20fantasy%20martial%20arts&image_size=square',
        description: '讲述了天才少年萧炎在创造了家族空前绝后的修炼纪录后突然成了废人，种种打击接踵而至。就在他即将绝望的时候，一缕幽魂从他手上的戒指里浮现，一扇全新的大门在面前开启！',
        updateTime: '2024-01-15',
        isCompleted: true,
        category: '玄幻',
        wordCount: '528万字',
      },
      {
        id: '2',
        name: '凡人修仙传',
        author: '忘语',
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=novel%20book%20cover%20xianxia%20immortal%20cultivation&image_size=square',
        description: '一个普通山村小子，偶然下进入到当地江湖小门派，成了一名记名弟子，他以这样身份，如何在门派中立足,如何以平庸的资质进入到修仙者的行列，从而笑傲三界之中！',
        updateTime: '2024-01-14',
        isCompleted: true,
        category: '仙侠',
        wordCount: '770万字',
      },
      {
        id: '3',
        name: '三体',
        author: '刘慈欣',
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=science%20fiction%20book%20cover%20space%20universe&image_size=square',
        description: '地球文明向宇宙发出的第一声啼鸣，以太阳为中心，以光速向宇宙深处飞驰……',
        updateTime: '2024-01-13',
        isCompleted: true,
        category: '科幻',
        wordCount: '36万字',
      },
      {
        id: '4',
        name: '雪中悍刀行',
        author: '烽火戏诸侯',
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wuxia%20martial%20arts%20book%20cover%20snow&image_size=square',
        description: '江湖是一张珠帘。大人物小人物，是珠子，大故事小故事，是串线。情义二字，则是那些珠子的精气神。',
        updateTime: '2024-01-12',
        isCompleted: true,
        category: '武侠',
        wordCount: '460万字',
      },
      {
        id: '5',
        name: '诡秘之主',
        author: '爱潜水的乌贼',
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20fantasy%20mystery%20book%20cover&image_size=square',
        description: '周明瑞因为意外，进入了一个神奇的世界。这里有蒸汽与机械的交织，有神秘莫测的力量体系，有传说中的诡秘之主。',
        updateTime: '2024-01-11',
        isCompleted: true,
        category: '奇幻',
        wordCount: '446万字',
      },
      {
        id: '6',
        name: '遮天',
        author: '辰东',
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=celestial%20immortal%20novel%20cover%20stars&image_size=square',
        description: '冰冷与黑暗并存的宇宙深处，九具庞大的龙尸拉着一口青铜古棺，亘古长存。',
        updateTime: '2024-01-10',
        isCompleted: true,
        category: '仙侠',
        wordCount: '630万字',
      },
    ],
  }
}

export const getBookDetailMock = (bookId) => {
  const books = {
    '1': {
      id: '1',
      name: '斗破苍穹',
      author: '天蚕土豆',
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=novel%20book%20cover%20fantasy%20martial%20arts&image_size=square',
      description: '讲述了天才少年萧炎在创造了家族空前绝后的修炼纪录后突然成了废人，种种打击接踵而至。就在他即将绝望的时候，一缕幽魂从他手上的戒指里浮现，一扇全新的大门在面前开启！',
      updateTime: '2024-01-15',
      isCompleted: true,
      category: '玄幻',
      wordCount: '528万字',
      chapters: [
        { id: 'c1', title: '第一章 陨落的天才', wordCount: 3200 },
        { id: 'c2', title: '第二章 斗气大陆', wordCount: 2800 },
        { id: 'c3', title: '第三章 药老', wordCount: 3100 },
        { id: 'c4', title: '第四章 修炼', wordCount: 2900 },
        { id: 'c5', title: '第五章 突破', wordCount: 3000 },
        { id: 'c6', title: '第六章 家族比斗', wordCount: 3500 },
        { id: 'c7', title: '第七章 云岚宗', wordCount: 2800 },
        { id: 'c8', title: '第八章 三年之约', wordCount: 3200 },
      ],
    },
    '2': {
      id: '2',
      name: '凡人修仙传',
      author: '忘语',
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=novel%20book%20cover%20xianxia%20immortal%20cultivation&image_size=square',
      description: '一个普通山村小子，偶然下进入到当地江湖小门派，成了一名记名弟子，他以这样身份，如何在门派中立足,如何以平庸的资质进入到修仙者的行列，从而笑傲三界之中！',
      updateTime: '2024-01-14',
      isCompleted: true,
      category: '仙侠',
      wordCount: '770万字',
      chapters: [
        { id: 'c1', title: '第一章 山村少年', wordCount: 2500 },
        { id: 'c2', title: '第二章 踏入仙途', wordCount: 2800 },
        { id: 'c3', title: '第三章 黄枫谷', wordCount: 3000 },
        { id: 'c4', title: '第四章 初露锋芒', wordCount: 2700 },
        { id: 'c5', title: '第五章 血色试炼', wordCount: 3200 },
      ],
    },
    '3': {
      id: '3',
      name: '三体',
      author: '刘慈欣',
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=science%20fiction%20book%20cover%20space%20universe&image_size=square',
      description: '地球文明向宇宙发出的第一声啼鸣，以太阳为中心，以光速向宇宙深处飞驰……',
      updateTime: '2024-01-13',
      isCompleted: true,
      category: '科幻',
      wordCount: '36万字',
      chapters: [
        { id: 'c1', title: '第一章 科学边界', wordCount: 4000 },
        { id: 'c2', title: '第二章 三体游戏', wordCount: 3500 },
        { id: 'c3', title: '第三章 叶文洁', wordCount: 3800 },
        { id: 'c4', title: '第四章 红岸基地', wordCount: 4200 },
      ],
    },
  }

  return {
    success: true,
    data: books[bookId] || books['1'],
  }
}

export const parseUrlMock = (url) => {
  if (url.includes('book')) {
    return {
      success: true,
      data: {
        type: 'book',
        book: {
          id: '1',
          name: '斗破苍穹',
          author: '天蚕土豆',
          cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=novel%20book%20cover%20fantasy%20martial%20arts&image_size=square',
          description: '测试书籍',
          updateTime: '2024-01-15',
          isCompleted: true,
          category: '玄幻',
          wordCount: '528万字',
        },
      },
    }
  } else if (url.includes('store')) {
    return {
      success: true,
      data: {
        type: 'store',
        books: getBooksMock().data,
      },
    }
  } else if (url.includes('chapter') || url.includes('page')) {
    return {
      success: true,
      data: {
        type: 'chapter',
        bookId: '1',
        chapterId: 'c1',
        title: '第一章 陨落的天才',
        content: '    萧炎，萧家历史上空前绝后的斗气修炼天才。\n\n    年仅六岁那年，他便觉醒了斗气，九岁突破斗者，十一岁突破斗师，十三岁便已是斗灵级别，这样的修炼速度，堪称妖孽！\n\n    然而，天才的光环并没有持续太久。\n\n    在他十五岁那年，一切都改变了。\n\n    斗气，消失了。\n\n    从天才沦为废柴，仅仅用了三年时间。\n\n    曾经的荣耀，如今已变成了无尽的嘲讽和白眼。',
      },
    }
  } else {
    return {
      success: false,
      message: '无法识别的链接类型',
    }
  }
}

export const checkPaymentMock = () => {
  return {
    success: true,
    data: {
      isPaid: false,
      expiresAt: null,
      features: ['basic_read', 'cloud_sync', 'ai_parse'],
    },
  }
}
