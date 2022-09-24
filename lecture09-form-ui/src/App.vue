<template>
  <div class="mx-3 my-3">
    <!-- header -->
    <b-jumbotron header="Contact Card Editor" />

    <b-form>
      <b-form-group
        label="First name:"
        label-for="first-name-input"
      >
        <b-form-input id="first-name-input" v-model="currentCard.firstName" placeholder="Jane" />
      </b-form-group>
      <b-form-group
        label="Last name:"
        label-for="last-name-input"
      >
        <b-form-input id="last-name-input" v-model="currentCard.lastName" placeholder="Doe" />
      </b-form-group>
      <b-form-group
        label="E-mail address:"
        label-for="email-input"
        description="Your e-mail address will be kept confidential."
      >
        <b-form-input id="email-input" v-model="currentCard.email" :state="!emailValidation" type="email" placeholder="jane.doe@notreal.cs.duke.edu" required />
        <b-form-invalid-feedback :state="!emailValidation">{{ emailValidation }}</b-form-invalid-feedback>
      </b-form-group>
    </b-form>

    <b-button class="mr-2 mb-2" @click="handleClickSampleCard1">Sample Card 1</b-button>
    <b-button class="mr-2 mb-2" @click="handleClickSampleCard2">Sample Card 2</b-button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from 'vue'

interface ContactCard {
  firstName: string
  lastName: string
  email: string
}

const currentCard: Ref<ContactCard> = ref({ firstName: "", lastName: "", email: "" })

const emailValidation = computed(() => {
  if (currentCard.value.email.length === 0) {
    return "An e-mail address is required."
  } else if (currentCard.value.email.indexOf("@") <= 0) {
    return "This is not a valid e-mail address."
  } else {
    return ""
  }
})

const sampleCards: ContactCard[] = [
  {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@notreal.cs.duke.edu"
  },
  {
    firstName: "Wei",
    lastName: "Zhang",
    email: "wei.zhang@notreal.cs.duke.edu"
  },
]

function loadSampleCard(card: ContactCard) {
  // currentCard.value = JSON.parse(JSON.stringify(card))
  currentCard.value = { ...card }
}

function handleClickSampleCard1() {
  loadSampleCard(sampleCards[0])  
}

function handleClickSampleCard2() {
  loadSampleCard(sampleCards[1])  
}

watch(currentCard, () => {
  console.log("card updated!", JSON.stringify(currentCard.value))
}, { deep: true })
</script>