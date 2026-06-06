<template>
  <div class="login">
    <div class="auth-card">
      <h3 class="title">{{ title }}</h3>

      <!-- 登录 / 注册 切换 -->
      <el-tabs v-model="activeTab" class="auth-tabs" stretch>
        <el-tab-pane label="登录" name="login" />
        <el-tab-pane label="注册" name="register" v-if="registerEnabled" />
      </el-tabs>

      <!-- 登录表单 -->
      <el-form
        v-show="activeTab === 'login'"
        ref="loginRef"
        :model="loginForm"
        :rules="loginRules"
        class="auth-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            type="text"
            size="large"
            auto-complete="off"
            placeholder="注册邮箱"
          >
            <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            size="large"
            auto-complete="off"
            placeholder="密码"
            @keyup.enter="handleLogin"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code" v-if="captchaEnabled">
          <el-input
            v-model="loginForm.code"
            size="large"
            auto-complete="off"
            placeholder="验证码"
            style="width: 63%"
            @keyup.enter="handleLogin"
          >
            <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
          </el-input>
          <div class="login-code">
            <img :src="codeUrl" @click="getCode" class="login-code-img" alt="验证码" />
          </div>
        </el-form-item>
        <el-checkbox v-model="loginForm.rememberMe" style="margin: 0 0 20px 0;">记住密码</el-checkbox>
        <el-form-item style="width: 100%;">
          <el-button
            :loading="loading"
            size="large"
            type="primary"
            style="width: 100%;"
            @click.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 注册表单（第一步：邮箱 + 验证码） -->
      <el-form
        v-show="activeTab === 'register'"
        ref="registerRef"
        :model="registerForm"
        :rules="registerRules"
        class="auth-form"
      >
        <el-form-item prop="userType">
          <el-radio-group v-model="registerForm.userType" class="user-type-group">
            <el-radio :label="0">普通用户</el-radio>
            <el-radio :label="1">商家</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="nickName">
          <el-input
            v-model="registerForm.nickName"
            type="text"
            size="large"
            auto-complete="off"
            placeholder="昵称（选填）"
          >
            <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            type="text"
            size="large"
            auto-complete="off"
            placeholder="邮箱地址"
          >
            <template #prefix><svg-icon icon-class="email" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="emailCode">
          <el-input
            v-model="registerForm.emailCode"
            size="large"
            auto-complete="off"
            placeholder="邮箱验证码"
            style="width: 63%"
            @keyup.enter="handleVerifyAndNext"
          >
            <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
          </el-input>
          <div class="login-code">
            <el-button
              size="small"
              type="primary"
              :disabled="smsButtonDisabled"
              @click="handleSendEmailCode"
              class="sms-btn"
            >
              {{ smsButtonText }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item style="width: 100%;">
          <el-button
            :loading="verifyLoading"
            size="large"
            type="primary"
            style="width: 100%;"
            @click.prevent="handleVerifyAndNext"
          >
            <span v-if="!verifyLoading">验证并设置密码</span>
            <span v-else>验证中...</span>
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 游客登录 -->
      <div class="visitor-section">
        <el-divider>或</el-divider>
        <el-button size="large" style="width: 100%;" @click.prevent="handleVisitorLogin">
          游客登录（无需注册）
        </el-button>
        <p class="visitor-tip">游客可浏览酒店信息，预订和评价需注册登录</p>
      </div>
    </div>

    <!-- 注册第二步：设置密码弹窗 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="设置登录密码"
      width="400px"
      :close-on-click-modal="false"
      @closed="resetPasswordForm"
    >
      <el-form ref="passwordRef" :model="passwordForm" :rules="passwordRules" label-width="0">
        <p class="dialog-tip">邮箱 {{ registerForm.email }} 已验证，请设置密码完成注册</p>
        <el-form-item prop="password">
          <el-input
            v-model="passwordForm.password"
            type="password"
            size="large"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            size="large"
            placeholder="请再次输入密码"
            show-password
            @keyup.enter="handleRegister"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="registerLoading" @click="handleRegister">
          完成注册
        </el-button>
      </template>
    </el-dialog>

    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg, register } from "@/api/login"
import { sendEmailCode, verifyEmailCode } from "@/api/email"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import { setToken } from '@/utils/auth'
import useUserStore from '@/store/modules/user'
import usePermissionStore from '@/store/modules/permission'
import defaultSettings from '@/settings'
import { ElMessage } from 'element-plus'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const activeTab = ref('login')
const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: ""
})

const registerForm = ref({
  email: "",
  emailCode: "",
  nickName: "",
  userType: 0
})

const passwordForm = ref({
  password: "",
  confirmPassword: ""
})

const loginRules = computed(() => {
  const rules = {
    username: [{ required: true, trigger: "blur", message: "请输入注册邮箱" }],
    password: [{ required: true, trigger: "blur", message: "请输入您的密码" }]
  }
  if (captchaEnabled.value) {
    rules.code = [{ required: true, trigger: "change", message: "请输入验证码" }]
  }
  return rules
})

const registerRules = {
  userType: [{ required: true, trigger: "change", message: "请选择用户类型" }],
  email: [
    { required: true, trigger: "blur", message: "请输入邮箱地址" },
    { type: 'email', message: "请输入正确的邮箱地址", trigger: "blur" }
  ],
  emailCode: [
    { required: true, trigger: "blur", message: "请输入验证码" },
    { len: 6, message: "验证码长度为6位", trigger: "blur" }
  ]
}

const equalToPassword = (rule, value, callback) => {
  if (passwordForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const passwordRules = {
  password: [
    { required: true, trigger: "blur", message: "请输入您的密码" },
    { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" },
    { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\ |", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { validator: equalToPassword, trigger: "blur" }
  ]
}

const codeUrl = ref("")
const loading = ref(false)
const verifyLoading = ref(false)
const registerLoading = ref(false)
const captchaEnabled = ref(true)
const registerEnabled = ref(true)
const passwordDialogVisible = ref(false)
const smsButtonDisabled = ref(false)
const smsButtonText = ref("获取验证码")
const redirect = ref(undefined)
let smsTimer = null

watch(route, (newRoute) => {
  redirect.value = newRoute.query && newRoute.query.redirect
  if (newRoute.query.tab === 'register' && registerEnabled.value) {
    activeTab.value = 'register'
  }
}, { immediate: true })

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true
      sessionStorage.removeItem('isVisitor')
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 })
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
      } else {
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }
      userStore.login(loginForm.value).then(() => {
        // 登录成功后获取用户信息并生成菜单
        userStore.getInfo().then(() => {
          // 生成路由菜单
          usePermissionStore().generateRoutes().then(() => {
            const query = route.query
            const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
              if (cur !== "redirect") {
                acc[cur] = query[cur]
              }
              return acc
            }, {})
            // 判断用户角色，管理员跳转到管理页面，普通用户和商户跳转到主页
            const isAdmin = userStore.roles && userStore.roles.some(role => role === 'admin' || role === 'ROLE_ADMIN')
            if (isAdmin) {
              router.push({ path: redirect.value || "/dashboard", query: otherQueryParams })
            } else {
              router.push({ path: redirect.value || "/index", query: otherQueryParams })
            }
          })
        }).catch(() => {
          loading.value = false
          if (captchaEnabled.value) {
            getCode()
          }
        })
        // 直接跳转到目标路径，由权限守卫统一处理用户信息获取和路由生成
        router.push('/index')
      }).catch(() => {
        loading.value = false
        if (captchaEnabled.value) {
          getCode()
        }
      })
    }
  })
}

function handleSendEmailCode() {
  const email = registerForm.value.email
  if (!email || !/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email)) {
    ElMessage.warning("请输入正确的邮箱地址")
    return
  }
  smsButtonDisabled.value = true
  sendEmailCode(email).then(() => {
    ElMessage.success("验证码已发送，请注意查收邮箱")
    startEmailCountdown()
  }).catch(() => {
    smsButtonDisabled.value = false
    smsButtonText.value = "获取验证码"
  })
}

function startEmailCountdown() {
  let count = 60
  smsButtonText.value = count + "秒后重新获取"
  if (smsTimer) clearInterval(smsTimer)
  smsTimer = setInterval(() => {
    count--
    if (count <= 0) {
      clearInterval(smsTimer)
      smsButtonDisabled.value = false
      smsButtonText.value = "获取验证码"
    } else {
      smsButtonText.value = count + "秒后重新获取"
    }
  }, 1000)
}

function handleVerifyAndNext() {
  proxy.$refs.registerRef.validate(valid => {
    if (!valid) return
    verifyLoading.value = true
    const { email, emailCode } = registerForm.value
    verifyEmailCode(email, emailCode).then(() => {
      ElMessage.success("验证成功，请设置密码")
      passwordDialogVisible.value = true
    }).finally(() => {
      verifyLoading.value = false
    })
  })
}

function handleRegister() {
  proxy.$refs.passwordRef.validate(valid => {
    if (!valid) return
    registerLoading.value = true
    const data = {
      email: registerForm.value.email,
      password: passwordForm.value.password,
      nickName: registerForm.value.nickName,
      userType: registerForm.value.userType
    }
    register(data).then(res => {
      passwordDialogVisible.value = false
      ElMessage.success("注册成功，正在进入系统...")
      sessionStorage.removeItem('isVisitor')
      setToken(res.token)
      userStore.token = res.token
      navigateAfterAuth()
    }).catch(() => {
      registerLoading.value = false
    })
  })
}

function resetPasswordForm() {
  passwordForm.value = { password: "", confirmPassword: "" }
  registerLoading.value = false
  proxy.$refs.passwordRef?.resetFields()
}

function handleVisitorLogin() {
  sessionStorage.setItem('isVisitor', 'true')
  router.push(redirect.value || '/index')
}

function navigateAfterAuth() {
  const query = route.query
  const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
    if (cur !== "redirect" && cur !== "tab") {
      acc[cur] = query[cur]
    }
    return acc
  }, {})
  router.push({ path: redirect.value || "/", query: otherQueryParams })
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    registerEnabled.value = res.registerUser === undefined ? true : res.registerUser
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      loginForm.value.uuid = res.uuid
    }
  })
}

function getCookie() {
  const username = Cookies.get("username")
  const password = Cookies.get("password")
  const rememberMe = Cookies.get("rememberMe")
  loginForm.value = {
    username: username === undefined ? "" : username,
    password: password === undefined ? "" : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
    code: "",
    uuid: ""
  }
}

getCode()
getCookie()
</script>

<style lang='scss' scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #ff7a45 0%, #ff9561 50%, #ffa940 100%);
  position: relative;
  overflow: hidden;
}

.login::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.title {
  margin: 0 auto 20px auto;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  letter-spacing: 2px;
}

.auth-card {
  position: relative;
  z-index: 1;
  border-radius: 16px;
  background: #ffffff;
  width: 420px;
  padding: 40px 40px 30px;
  box-shadow: 0 20px 60px rgba(255, 122, 69, 0.3);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-tabs {
  margin-bottom: 25px;

  :deep(.el-tabs__nav) {
    justify-content: center;
    margin: 0 0 15px;
  }

  :deep(.el-tabs__item) {
    font-size: 16px;
    font-weight: 500;
    color: #606266;
    padding: 0 24px;

    &.is-active {
      color: #ff7a45;
      font-weight: 600;
    }
  }

  :deep(.el-tabs__active-bar) {
    background: linear-gradient(90deg, #ff7a45, #ffa940);
    height: 3px;
    border-radius: 3px;
  }
}

.auth-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input) {
    height: 48px;
    border-radius: 10px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #e8e8e8;

    &:hover {
      box-shadow: 0 4px 12px rgba(255, 122, 69, 0.15);
      border-color: #ffd5b8;
    }

    &.is-focus {
      box-shadow: 0 0 0 2px rgba(255, 122, 69, 0.2), 0 4px 12px rgba(255, 122, 69, 0.15);
      border-color: #ff7a45;
    }

    input {
      height: 48px;
      font-size: 15px;
      color: #303133;
    }
  }

  :deep(.el-input__prefix) {
    width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    transition: color 0.3s ease;
  }

  :deep(.el-input.is-focus .el-input__prefix) {
    color: #ff7a45;
  }

  .input-icon {
    height: 20px;
    width: 20px;
  }
}

.user-type-group {
  display: flex;
  justify-content: center;
  gap: 60px;
  padding: 10px 0;

  :deep(.el-radio) {
    font-size: 15px;
    color: #606266;
    transition: all 0.3s ease;

    &:hover {
      color: #ff7a45;
    }

    &.is-checked {
      color: #ff7a45;
    }
  }

  :deep(.el-radio__inner) {
    width: 18px;
    height: 18px;
    border: 2px solid #dcdfe6;
    border-radius: 50%;
    transition: all 0.3s ease;

    &:hover {
      border-color: #ff7a45;
    }
  }

  :deep(.el-radio.is-checked .el-radio__inner) {
    border-color: #ff7a45;
    background: linear-gradient(135deg, #ff7a45, #ffa940);

    &::after {
      background: #fff;
      transform: scale(1);
    }
  }
}

.login-code {
  width: 33%;
  height: 48px;
  float: right;
}

.sms-btn {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ff7a45, #ffa940);
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 122, 69, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.login-code-img {
  height: 48px;
  padding-left: 8px;
  cursor: pointer;
  border-radius: 10px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
}

:deep(.el-checkbox) {
  margin: 0 0 20px 0;

  :deep(.el-checkbox__label) {
    font-size: 13px;
    color: #909399;
  }

  :deep(.el-checkbox__inner) {
    border-radius: 4px;
    border-color: #dcdfe6;
    transition: all 0.3s ease;
  }

  :deep(.el-checkbox.is-checked .el-checkbox__inner) {
    background: linear-gradient(135deg, #ff7a45, #ffa940);
    border-color: #ff7a45;
  }
}

:deep(.el-button--primary) {
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ff7a45, #ffa940);
  border: none;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #fff;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 122, 69, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

.visitor-section {
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px dashed #e8e8e8;

  :deep(.el-divider) {
    margin: 0 0 16px;

    :deep(.el-divider__text) {
      font-size: 13px;
      color: #909399;
      background: #fff;
      padding: 0 12px;
    }
  }
}

:deep(.el-button--default) {
  height: 44px;
  border-radius: 10px;
  border: 2px solid #dcdfe6;
  font-size: 15px;
  font-weight: 500;
  color: #606266;
  transition: all 0.3s ease;

  &:hover {
    border-color: #ff7a45;
    color: #ff7a45;
    background: rgba(255, 122, 69, 0.05);
  }
}

.visitor-tip {
  margin: 12px 0 0;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.dialog-tip {
  margin: 0 0 20px;
  font-size: 14px;
  color: #606266;
  text-align: center;
}

:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #ff7a45, #ffa940);
  padding: 20px 24px;

  :deep(.el-dialog__title) {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
  }

  :deep(.el-dialog__close) {
    color: rgba(255, 255, 255, 0.8);

    &:hover {
      color: #fff;
    }
  }
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
}

.el-login-footer {
  position: fixed;
  bottom: 30px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  letter-spacing: 1px;
  z-index: 1;
}

@media (max-width: 500px) {
  .auth-card {
    width: 90%;
    padding: 30px 24px 20px;
    margin: 0 16px;
  }

  .title {
    font-size: 20px;
  }
}
</style>
