<template>
  <div class="hello">
    <!-- <textarea spellcheck="false">
                _  _ __, _,   _,  _, _, _ __,   ___  _,
                |  | |_  |   / ` / \ |\/| |_     |  / \
                |/\| |   | , \ , \ / |  | |      |  \ /
                ~  ~ ~~~ ~~~  ~   ~  ~  ~ ~~~    ~   ~

            ___  _, _,  _,_  _, _,_  _, __,  _, _  _, _, _ __,
             |  /_\ |   |_/ (_  |_| / \ |_)  |\ | /_\ |\/| |_
             |  | | | , | \ , ) | | \ / |  , | \| | | |  | |
             ~  ~ ~ ~~~ ~ ~  ~  ~ ~  ~  ~  ~ ~  ~ ~ ~ ~  ~ ~~~

    # create an account for yourself
    $ nscli keys add YOUR_NAME

    # query an account
    $ nscli query account $(nscli keys show YOUR_NAME --address) \
    --indent --chain-id namechain --node=cli.talkshop.name:26657

    # send some money
    $ nscli tx send --amount 1nametoken \
    --chain-id namechain  --node=cli.talkshop.name:26657 \
    --from $(nscli keys show YOUR_NAME --address) \
    --to $(nscli keys show THEIR_NAME --address)

    # buy a name!
    $ nscli tx nameservice buy-name SOME_DOMAIN 5nametoken \
    --from     $(nscli keys show YOUR_NAME --address) \
    --chain-id namechain --node=cli.talkshop.name:26657

    # set a resolver
    $ nscli tx nameservice set-name SOME_DOMAIN SOME_VALUE\
    --from     $(nscli keys show YOUR_NAME --address) \
    --chain-id namechain --node=cli.talkshop.name:26657

    # resolve a name
    $ nscli query nameservice resolve SOME_DOMAIN \
    --chain-id namechain --node=cli.talkshop.name:26657

    # get the whole whois of a name
    $ nscli query nameservice whois SOME_DOMAIN \
    --chain-id namechain --node=cli.talkshop.name:26657</textarea
    > -->
    <form @submit.prevent="submit">
      <vue-recaptcha
        ref="recaptcha"
        @verify="onCaptchaVerified"
        @expired="onCaptchaExpired"
        size="invisible"
        :sitekey="google">
      </vue-recaptcha>
      Faucet: <input v-model="address" required placeholder="Wallet Address" class="" name="address" type="text" />
      <button :disabled="status==='submitting'" type="submit" class="button"></button>
      <div v-if="status">{{status}}</div>
      <div v-if="serverError">{{serverError}}</div>
      <div v-if="sucessfulServerResponse">{{sucessfulServerResponse}}</div>
    </form>
  </div>
</template>

<script>

import VueRecaptcha from 'vue-recaptcha'
import axios from 'axios'

export default {
  name: 'HelloWorld',
  data () {
    return {
      status: null,
      address: null,
      sucessfulServerResponse: '',
      serverError: '',
      google: '6Lc3BZsUAAAAAJXlwIGzPNh0StJ9GuLd0k6L95ur'
    }
  },
  methods: {
    submit: function () {
      this.status = 'submitting'
      // this.$refs.recaptcha.execute()
      this.onCaptchaVerified()
    },
    onCaptchaVerified: async function (recaptchaToken) {
      const self = this
      self.status = 'submitting'
      self.$refs.recaptcha.reset()
      try {
        let response = await axios.post('/faucet', {
          recepient: self.address,
          recaptchaToken: recaptchaToken
        })
        if (response.status === 200) {
          self.sucessfulServerResponse = 'Thank you, you\'ve received some nametoken!'
          self.address = ''
        } else {
          self.sucessfulServerResponse = response.data
        }
      } catch (err) {
        let foo = getErrorMessage(err)
        self.serverError = foo === '"read ECONNRESET"' ? 'Opps, we had a connection issue, please try again' : foo
      }
      self.status = ''
    },
    onCaptchaExpired: function () {
      self.status = ''
      this.$refs.recaptcha.reset()
    }
  },
  components: {
    VueRecaptcha
  }
}

// helper to get a displayable message to the user
function getErrorMessage (err) {
  let responseBody
  responseBody = err.response
  if (!responseBody) {
    responseBody = err
  } else {
    responseBody = err.response.data || responseBody
  }
  return responseBody.message || JSON.stringify(responseBody)
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
textarea {
  text-align: left;
  width: 100%;
  max-width: 580px;
  height: 400px;
  font-size: 14px;
  font-family: monospace;
  padding: 20px;
  line-height: 1.4em;
  background-color: grey;
  color: white;
  border: 0px;
  border-radius: 20px;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: white;
  text-decoration: none;
}
</style>
