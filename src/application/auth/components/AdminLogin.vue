<template>
  <div class="auth evo">
    <Particles v-if="$q.screen.gt.sm" class="show-background-img" />
    <div class="row z-max">
      <div class="col-md-3 col-lg-2 rounded-borders" :class="{ 'absolute-center': $q.screen.gt.sm }">
        <div class="row login-area" :class="{ 'absolute-center full-width': !$q.screen.gt.sm }">
          <div class="col-12 login-area-header">
            <div class="row items-end justify-end">
              <div class="col-6" />
            </div>
          </div>
          <div class="col-12 login-area-body">
            <transition appear enter="fadeInDown" leave="fadeOutUp" :duration="1100">
              <div class="row items-center justify-center full-height full-width">
                <div class="col-12">
                  <q-card flat class="login-card">
                    <div class="language">
                      <div class="row justify-end">
                        <div class="col-md-5 q-pa-sm">
                          <!-- Todo Disable in live-->
                          <language v-if="false" />
                        </div>
                      </div>
                    </div>
                    <div class="login-area-login">
                      <div class="row justify-center no-margin">
                        <div class="col-5 mt-10">
                          <img class="logo responsive" src="~assets/logo.png" alt="logo" />
                        </div>
                      </div>
                      <q-card-section>
                        <div v-if="isLoginAction" class="row q-col-gutter-md">
                          <div class="col-12">
                            <form
                              class="form q-gutter-xs"
                              @submit.prevent="onSubmit"
                              @keyup.enter="onSubmit"
                              @keydown="clearFormFieldValidation($event.target.name)"
                            >
                              <div class="row q-col-gutter-md">
                                <div class="col-12">
                                  <q-input
                                    v-model.trim="form.email"
                                    class="required"
                                    hide-bottom-space
                                    dense
                                    outlined
                                    :error="setError('email', 'type.exp')"
                                    :error-message="setError('email', 'type.msg')"
                                    clearable
                                    autofocus
                                    :label="$t('Login.Email.Helper')"
                                    name="email"
                                  />
                                </div>
                                <div class="col-12">
                                  <q-input
                                    v-model.trim="form.password"
                                    class="required"
                                    hide-bottom-space
                                    dense
                                    outlined
                                    :error="setError('password', 'type.exp')"
                                    :error-message="setError('password', 'type.msg')"
                                    clearable
                                    name="password"
                                    :label="$t('Login.Password.Helper')"
                                    type="password"
                                  />
                                </div>
                              </div>
                            </form>
                          </div>
                          <div class="col-12">
                            <div class="row q-col-gutter-md justify-center items-center">
                              <div class="col-12">
                                <q-btn
                                  key="login-btn"
                                  color="primary-darkened"
                                  :rounded="!this.$configs.app.scope.evo"
                                  unelevated
                                  :loading="$wait.any"
                                  class="fit"
                                  @click="onSubmit"
                                >
                                  {{ $t('Login.LoginBtn') }}
                                </q-btn>
                              </div>
                              <div class="col-auto">
                                <q-btn
                                  key="reset-btn"
                                  rounded
                                  unelevated
                                  color="primary"
                                  size="sm"
                                  flat
                                  @click="isLogin(false)"
                                >
                                  {{ $t('Login.ResetPasswordBtn') }}
                                </q-btn>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div v-else class="row q-col-gutter-md">
                          <div class="col-12">
                            <form
                              class="form"
                              @submit.prevent="onSubmitResetOrUpdate"
                              @keyup.enter="onSubmitResetOrUpdate"
                              @keydown="clearFormFieldValidation($event.target.name)"
                            >
                              <div v-if="!isUpdateAction" class="row q-col-gutter-md">
                                <div class="col-12">
                                  <q-input
                                    v-model.trim="resetUpdateForm.email"
                                    class="required"
                                    hide-bottom-space
                                    dense
                                    outlined
                                    :error="setError('email', 'type.exp')"
                                    :error-message="setError('email', 'type.msg')"
                                    clearable
                                    autofocus
                                    :label="$t('Login.Email.Helper')"
                                    name="email"
                                  />
                                </div>
                              </div>
                              <div v-else class="row q-col-gutter-md">
                                <div class="col-12">
                                  <q-input
                                    v-model="resetUpdateForm.email"
                                    class="required"
                                    hide-bottom-space
                                    dense
                                    outlined
                                    :error="setError('email', 'type.exp')"
                                    :error-message="setError('email', 'type.msg')"
                                    clearable
                                    autofocus
                                    :label="$t('Login.Email.Helper')"
                                    name="email"
                                  />
                                </div>
                                <div class="col-12">
                                  <q-input
                                    v-model.trim="resetUpdateForm.password"
                                    class="required"
                                    autocomplete="off"
                                    hide-bottom-space
                                    dense
                                    outlined
                                    :error="setError('password', 'type.exp')"
                                    :error-message="setError('password', 'type.msg')"
                                    clearable
                                    autofocus
                                    name="password"
                                    :label="$t('Login.NewPassword.Helper')"
                                    type="password"
                                  />
                                </div>
                                <div class="col-12">
                                  <q-input
                                    v-model.trim="resetUpdateForm.password_confirmation"
                                    class="required"
                                    hide-bottom-space
                                    dense
                                    outlined
                                    :error="setError('password_confirmation', 'type.exp')"
                                    :error-message="setError('password_confirmation', 'type.msg')"
                                    clearable
                                    name="password"
                                    :label="$t('Login.PasswordConfirmation.Helper')"
                                    type="password"
                                  />
                                </div>
                                <div class="col-12">
                                  <q-input
                                    v-model.trim="resetUpdateForm.otp"
                                    class="required"
                                    hide-bottom-space
                                    dense
                                    outlined
                                    :error="setError('otp', 'type.exp')"
                                    :error-message="setError('otp', 'type.msg')"
                                    clearable
                                    type="number"
                                    :label="$t('Login.Otp.Helper')"
                                  />
                                </div>
                              </div>
                            </form>
                          </div>
                          <div class="col-12">
                            <div class="row q-col-gutter-md justify-center">
                              <div class="col-12">
                                <q-btn
                                  key="login-btn"
                                  rounded
                                  unelevated
                                  color="primary-darkened"
                                  :loading="$wait.any"
                                  class="fit"
                                  @click="onSubmitResetOrUpdate"
                                >
                                  {{ !isUpdateAction ? $t('Login.ResetBtn') : $t('Login.UpdateBtn') }}
                                </q-btn>
                              </div>
                              <div class="col-auto">
                                <q-btn
                                  key="reset-btn"
                                  rounded
                                  unelevated
                                  color="primary"
                                  flat
                                  size="sm"
                                  :disable="$wait.any"
                                  @click="isLogin(true)"
                                >
                                  {{ $t('Common.Back.Text') }}
                                </q-btn>
                              </div>
                            </div>
                          </div>
                        </div>
                        <AppVersion hide-product-name classes="text-center q-mt-sm"></AppVersion>
                      </q-card-section>
                    </div>
                  </q-card>
                </div>
              </div>
            </transition>
          </div>
          <div class="col-12 login-area-footer">
            <div class="row justify-center text-center">
              <div class="col-8">
                <p class="text-uppercase text-weight-light text-primary q-mt-sm">
                  <small>{{ $t('Common.Copyright.Text') }} {{ getCurrentYear() }} </small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Translation from 'src/application/global/components/common/translations/translation'
import { date, Platform } from 'quasar'
import { SetFormFieldErrorsMixin } from 'src/application/global/mixins/index'
import { getAccessToken } from 'src/services/authService'
import Particles from 'src/application/auth/components/Particles'
import { AppVersion } from 'src/application/global/components/common/elements'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Login',
  components: {
    Particles,
    language: Translation,
    AppVersion,
  },
  mixins: [SetFormFieldErrorsMixin],
  data() {
    return {
      isLoginAction: true,
      isUpdateAction: false,
      form: {
        email: '',
        password: '',
      },
      resetUpdateForm: {
        request_type: '',
        email: '',
        password: '',
        password_confirmation: '',
        otp: '',
      },
    }
  },
  computed: {
    ...mapState({
      auth: state => state.authCMP.auth,
      errors: state => state.globalCMP.errors.data,
      isProcessing: state => state.globalCMP.isProcessing,
      route: state => state.route,
    }),
    // Get screen height based on platform
    isDesktop() {
      return !!Platform.is.desktop
    },
    getLoginLogo() {
      return this.$configs.app.scope.evo ? "~assets/evo/logo.png" : "~assets/logo.png"
    },
  },
  mounted() {
    if (this.route.path.includes('reset')) {
      this.isLoginAction = false
      this.isUpdateAction = false
    } else if (this.route.path.includes('update')) {
      this.isLoginAction = false
      this.isUpdateAction = true
    } else {
      this.isLoginAction = true
      this.isUpdateAction = false
    }
  },
  methods: {
    ...mapActions(['loginAction', 'resetAction', 'updateAction', 'clearValidationAction', 'resetErrorsAction']),
    getCurrentYear() {
      let now = Date.now()
      return date.formatDate(now, 'YYYY')
    },
    isLogin(state) {
      this.resetErrorsAction()
      this.isLoginAction = state
      if (state) {
        this.$router.push({ name: 'Admin' })
      } else {
        this.$router.push({ name: 'Reset' })
      }
    },
    // Submit login form
    onSubmit() {
      this.loginAction(this.form).then(() => {
        this.$router.replace({ name: 'initialize' })
        if (this.$echo) {
          this.$echo.connector.options.auth.headers['Authorization'] = 'Bearer ' + getAccessToken()
        }
      })
    },
    // Submit reset/update form
    onSubmitResetOrUpdate() {
      if (!this.isUpdateAction) {
        this.resetAction(this.resetUpdateForm).then(() => {
          this.isUpdateAction = true
        })
      } else {
        this.resetUpdateForm.request_type = 'reset-password'
        this.updateAction(this.resetUpdateForm).then(() => {
          this.$router.push({ name: 'default' })
        })
      }
    },
    isEvo() {
      return true
      // return this.$configs.app.scope.evo;
    }
  },
}
</script>
<style lang="stylus">
.show-background-img
  background-image url("~assets/evo/login-bg.png")

.login-area-opacity
  background-color rgba(0, 0, 0, 0.6)
  overflow auto
</style>
<!--<style v-else lang="stylus">-->
<!--.show-background-img-->
<!--  background-image url("~assets/login-bg.png")-->

<!--.login-area-opacity-->
<!--  background-color rgba(0, 0, 0, 0.6)-->
<!--  overflow auto-->
<!--</style>-->
