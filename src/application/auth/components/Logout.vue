<script>
import { GeneralsMixin } from 'src/application/global/mixins/index'

export default {
  name: 'Logout',
  mixins: [GeneralsMixin],
  mounted() {
    this.logoutHandler()
  },
}
</script>
