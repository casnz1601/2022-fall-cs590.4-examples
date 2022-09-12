<template>
  <div class="mx-3 my-3">
    <!-- header -->
    <b-jumbotron header="Sign Up List" />

    <b-card-group deck>

      <!-- UI for showing current list -->
      <b-card title="Current List">
        <ol>
          <li v-for="name, i in currentList" :key="i">
            {{ name }}
          </li>
        </ol>
        <b-button @click="refresh">Refresh</b-button>
      </b-card>

      <!-- UI for adding to list -->
      <b-card title="Sign Up">
        <b-form-input v-model="name" class="mb-2" />
        <b-button @click="signup">Sign Up</b-button>
      </b-card>

    </b-card-group>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue'

const currentList: Ref<string[]> = ref([])
const name = ref("")

// async function refresh() {
//   const result = await fetch("/list")
//   list.value = await result.json()
// }

function refresh() {
  fetch("/current-list").then(result => {
    result.json().then(newList => {
      currentList.value = newList
    })
  })
}

// async function signup() {
//   await fetch(
//     "/signup", 
//     {
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ name: name.value }), 
//       method: "PUT"
//     }
//   )
//   name.value = ""
//   await refresh()
// }

function signup() {
  fetch(
    "/signup", 
    {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: name.value }), 
      method: "PUT"
    }
  ).then(() => {
    // reset the name field
    name.value = ""

    // load latest list
    refresh()
  })
}
</script>