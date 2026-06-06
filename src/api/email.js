import request from '@/utils/request'

// 发送邮箱验证码
export function sendEmailCode(email) {
  return request({
    url: '/sendEmailCode',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: { email }
  })
}

// 验证邮箱验证码
export function verifyEmailCode(email, emailCode) {
  return request({
    url: '/verifyEmailCode',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: { email, emailCode }
  })
}