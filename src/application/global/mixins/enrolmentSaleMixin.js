import moment from 'moment'

export default {
  computed: {
    getUserAddress() {
      let addresses = this.$helpers.getValue(this.enrollmentData, 'member_data.address.address_data')
      if (addresses) {
        if (typeof addresses === 'string') {
          return JSON.parse(addresses)
        } else {
          return addresses
        }
      }
      return []
    },
    serverValidationQuery() {
      let validate = {
        table: 'members',
        field: 'ic_passport_number',
        conditions: [
          {
            table: 'members',
            field: 'nationality_id',
            value: this.enrollmentData.member_data.details.nationality_id,
            operator: 'AND',
          },
          {
            table: 'members',
            field: 'ic_pass_type_id',
            value: this.enrollmentData.member_data.details.ic_pass_type_id,
            operator: 'AND',
          },
        ],
      }
      return validate
    },
    limitDOB() {
      return moment()
        .subtract(this.countryLegalAge, 'years')
        .format('YYYY/MM')
    },
    isReadOnly() {
      return this.lockSalesOrder
    },
  },
}
