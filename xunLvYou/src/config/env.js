const ENV = {
  LOCAL: 'local',
  DEV: 'dev',
  TEST: 'test',
  PROD: 'prod'
}

const ENV_CONFIG = {
  [ENV.LOCAL]: {
    baseURL: '',
    useLocalData: true
  },
  [ENV.DEV]: {
    baseURL: 'http://dev.api.xunlvyou.com',
    useLocalData: false
  },
  [ENV.TEST]: {
    baseURL: 'http://test.api.xunlvyou.com',
    useLocalData: false
  },
  [ENV.PROD]: {
    baseURL: 'https://api.xunlvyou.com',
    useLocalData: false
  }
}

const currentEnv = ENV.LOCAL

export function getEnv() {
  return currentEnv
}

export function getEnvConfig() {
  return ENV_CONFIG[currentEnv]
}

export function isLocalEnv() {
  return currentEnv === ENV.LOCAL
}

export default {
  ENV,
  currentEnv,
  getEnv,
  getEnvConfig,
  isLocalEnv
}
