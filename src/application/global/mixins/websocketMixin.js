import { date } from 'quasar'
import { mapGetters, mapMutations, mapState } from 'vuex'

export default {
  components: {
    date,
  },
  computed: {
    ...mapGetters(['getUserToken', 'getUserID']),
    ...mapState({
      websocket: state => state.globalCMP.websocket,
    }),
  },
  data: () => ({
    reconnecting_count: 0,
  }),
  mounted() {
    if (this.$echo) {
      this.$echo.connector.socket.on('connect', () => {
        this.setWebsocketStatus(true)
        this.writeLogData('a user connected with socketID: ', this.$echo.socketId())
      })
      this.$echo.connector.socket.on('reconnecting', attemptNumber => {
        this.reconnecting_count = attemptNumber
        this.setWebsocketStatus(false)
        this.writeLogData('reconnecting', attemptNumber)
      })
    }
  },
  methods: {
    ...mapMutations({
      writeWebsocketLog: 'WRITE_WEBSOCKET_LOG',
      setWebsocketStatus: 'SET_WEBSOCKET_STATUS',
      writeWebsocketChannelData: 'WRITE_CHANNEL_DATA',
      unsetWebsocketChannelData: 'UNSET_CHANNEL_DATA',
    }),
    writeLogData(type, data) {
      let logger = process.env.WEBSOCKET_LOGGER
      if (logger === 'true') {
        console.log(type, data !== undefined && data !== '' ? data : '')
      }
    },
  },
}
