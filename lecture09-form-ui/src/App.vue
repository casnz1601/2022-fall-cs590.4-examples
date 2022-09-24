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

    <hr/>

    <b-button class="mr-2 mb-2" :disabled="!canUndo" @click="undo">Undo</b-button>
    <b-button class="mr-2 mb-2" :disabled="!canRedo" @click="redo">Redo</b-button>
    <ol style="overflow-y: scroll; max-height: 6rem">
      <li v-for="x, i in undoRedoBuffer" :key="i">
        <pre :class="{ 'font-weight-bold': i === undoRedoIndex }">{{x}}</pre>
      </li>
    </ol>
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

const undoRedoBuffer = ref([JSON.stringify(currentCard.value)])
let undoRedoIndex = ref(0)

function undo() {
  // TODO:
}

const canUndo = computed(() => 
  // TODO:
  false
)

function redo() {
  // TODO:
}

const canRedo = computed(() => 
  // TODO:
  false
)

watch(currentCard, () => {
  const newString = JSON.stringify(currentCard.value)
  if (undoRedoIndex.value !== -1 && undoRedoBuffer.value[undoRedoIndex.value] === newString) {
    return
  }
  if (undoRedoIndex.value + 1 === undoRedoBuffer.value.length) {
    undoRedoBuffer.value.push(newString)
  } else {
    undoRedoBuffer.value.splice(undoRedoIndex.value + 1, undoRedoBuffer.value.length, newString)
  }
  ++undoRedoIndex.value
}, { deep: true })
</script>