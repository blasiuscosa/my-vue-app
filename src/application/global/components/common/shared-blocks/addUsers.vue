<template>
  <div>
    <div v-if="headerTitle" class="q-my-sm">
      {{ headerTitle }}
    </div>
    <form @keydown="clearFormFieldValidation($event.target.name)">
      <div class="row items-center q-col-gutter-sm">
        <div v-for="(user, index) in user_ids" :key="`user-${index}`" class="col-12">
          <q-select
            v-model="user.user_name"
            class="required"
            :disable="user[keyName] !== ''"
            :label="$t(placeholderText)"
            options-dense
            dense
            map-options
            use-input
            outlined
            :error="$v.user_ids.$each[index].$error || setError(getServerValidationKey(user), 'type.exp')"
            :error-message="
              $v.user_ids.$each[index].$error || setError(getServerValidationKey(user), 'type.exp')
                ? setError(getServerValidationKey(user), 'type.exp')
                  ? setError(getServerValidationKey(user), 'type.msg')
                  : $t('Common.PleaseSelect.Text', { term: $t('Common.User.Text') })
                : ''
            "
            :options="userList"
            hide-bottom-space
            @filter="(terms, update, abort) => search(terms, update, abort, user, keyName)"
            @input="item => selected(item, user, keyName)"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section>
                  <q-item-label v-html="scope.opt.label" />
                  <q-item-label caption>{{ scope.opt.sublabel }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ $t('Common.NoResult.Text') }}
                </q-item-section>
              </q-item>
            </template>
            <template slot="after">
              <q-btn
                rounded
                unelevated
                :disable="user_ids.length === minUserLength && user[keyName] === ''"
                icon="remove"
                color="negative"
                @click="removeUser(user, index)"
              />
            </template>
          </q-select>
        </div>
      </div>
    </form>
    <div class="row justify-between items-center q-mt-md">
      <div class="col-md-6 col-12">
        <info v-if="isAllSelected" icon="done" :message="$t('Common.ByDefaultAllSelected.Text')"></info>
      </div>
      <div class="col-auto">
        <q-btn
          rounded
          unelevated
          color="positive"
          icon="add"
          :disable="user_ids.length >= maxUserLength"
          @click="addNewUser"
        />
      </div>
    </div>
    <q-field
      class="required"
      :error="$v.user_ids.$error || error"
      :error-message="errorMessage"
      hide-bottom-space
      borderless
    ></q-field>
  </div>
</template>
<script>
import { minLength, required } from 'vuelidate/lib/validators'
import { SetFormFieldErrorsMixin } from 'src/application/global/mixins/index'
import { mapActions, mapState, mapGetters } from 'vuex'

export default {
  name: 'AddUsers',
  mixins: [SetFormFieldErrorsMixin],
  props: {
    value: {
      type: Array,
    },
    countryID: {
      type: [String, Number],
    },
    customAttributes: {
      type: Object,
      default: () => ({}),
    },
    componentType: {
      type: String,
      validator: function(value) {
        // The value must match one of these strings
        return ['stockist', 'members', 'users'].indexOf(value) !== -1
      },
    },
    callBack: {
      type: Function,
    },
    headerTitle: {
      type: String,
    },
    translateError: {
      type: String,
    },
    placeholderText: {
      type: String,
    },
    minUserLength: {
      type: Number,
      default: 1,
    },
    maxUserLength: {
      type: Number,
      default: 10,
    },
    additionalSearchQuery: {
      type: Object,
    },
    error: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
    },
    keyName: {
      type: String,
      default: 'user_id',
    },
    serverValidationSelector: {
      type: String,
      default: 'row',
      validator: function(value) {
        // The value must match one of these strings
        return ['parent', 'row'].indexOf(value) !== -1
      },
    },
  },
  data: () => ({
    user_ids: [],
    userList: [],
  }),
  validations() {
    return {
      user_ids: {
        minLength: minLength(this.minUserLength),
        $each: {
          [this.keyName]: {
            required,
          },
        },
      },
    }
  },
  computed: {
    ...mapState({
      selectedFilters: state => state.globalCMP.selectedFilters,
      countriesOptions: state => state.globalCMP.countriesOptions.data,
      stockistSearchData: state => state.stockistCMP.stockistSearchData,
      membersSearchData: state => state.globalCMP.memberSearchDataGlobal,
      errors: state => state.globalCMP.errors.data,
    }),
    ...mapGetters({
      userSearchData: 'userListSearchResult',
    }),
    isAllSelected() {
      return this.minUserLength === 0 && this.user_ids.length === 0
    },
  },
  mounted() {
    if (this.minUserLength > 0) {
      this.user_ids.push(this.getNewRow())
    }
  },
  methods: {
    ...mapActions(['getStockistSearchAction', 'getMemberSearchAction', 'getUsersListAction']),
    async search(terms, update, abort, user, field) {
      if (terms !== '') {
        let query = {}
        if (this.additionalSearchQuery) {
          query = _.merge(this.additionalSearchQuery)
        }
        query.skipLoading = true
        if (field === this.keyName) {
          if (this.componentType === 'stockist') {
            query.country_id = this.countryID
            query.search_text = terms
            query.limit = 10
            await this.getStockistSearchAction(query)
            update(() => {
              this.userList = this.mapSearchData(this.stockistSearchData)
            })
          } else if (this.componentType === 'users') {
            query.search_text = terms
            query.limit = 10
            await this.getUsersListAction(query)
            update(() => {
              this.userList = this.mapSearchData(this.userSearchData)
            })
          } else {
            query.search_text = terms
            query.limit = 10
            await this.getMemberSearchAction(query)
            update(() => {
              this.userList = this.mapSearchData(this.membersSearchData)
            })
          }
        }
      } else {
        abort()
      }
    },
    selected(item, user, field) {
      this[field] = item.sublabel
      if (field === this.keyName) {
        user[this.keyName] = item.user_id
        user.user_name = item.label
      }
      this.$emit('input', this.user_ids)
      if (typeof this.callBack === 'function') {
        this.callBack()
      }
    },
    getNewRow() {
      let row = {
        [this.keyName]: '',
        user_name: '',
      }
      if (this.customAttributes !== 'undefined' && Object.keys(this.customAttributes).length > 0) {
        row = { ...row, ...this.customAttributes }
      }
      return row
    },
    addNewUser() {
      this.user_ids.push(this.getNewRow())
    },
    removeUser(user, index) {
      this.user_ids.splice(index, 1)
    },
    mapSearchData(searchData = []) {
      let mappings = []
      searchData.list.map(item => {
        mappings.push(
          _.mapKeys(item, (value, key) => {
            // Todo uniform keys
            let newKey = key
            if (key === 'user_id') {
              newKey = 'id'
            }
            if (key === 'stockist_id' || key === 'userID') {
              newKey = 'user_id'
            }
            return newKey
          })
        )
      })
      return mappings
    },
    getServerValidationKey(user) {
      let key = null
      if (this.serverValidationSelector === 'parent') {
        key = this.keyName
      } else {
        key = user[this.keyName]
      }
      return key.toString()
    },
    validate() {
      this.$v.$touch()
      return !this.$v.$error
    },
  },
}
</script>
