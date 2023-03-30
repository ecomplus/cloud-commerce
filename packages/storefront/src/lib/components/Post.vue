<template>
  <main>
    <h1>{{ data?.data?.post.title }}</h1>
    <pre>
        <!-- @ts-ignore -->
        {{ JSON.stringify(data?.data?.post?.body, null, 2) }}
      </pre>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { client } from '../../../tina/__generated__/client'
import type { PostQuery, Exact } from '../../../tina/__generated__/types'

interface Data {
  data: PostQuery
  variables: Exact<{
    relativePath: string
  }>
  query: string
}

function getTinaUpdates<T extends object>({
  data,
  query,
  variables,
  cb,
}: {
  query: string
  variables: object
  data: T
  cb: (data: T) => void
}) {
  if (!import.meta.env.SSR) {
    const id = btoa(JSON.stringify({ query: query }))
    window.parent.postMessage(
      // was getting errors in vue here. Is it OK to parse and stringify?
      JSON.parse(JSON.stringify({ type: 'open', data, query, variables, id })),
      window.location.origin
    )
    window.addEventListener('message', (event) => {
      if (event.data.id === id) {
        console.log('child: event received')
        cb(event.data.data)
      }
    })
  }
}
const closeTinaConnection = ({
  query,
  id,
}: {
  query: string
  id?: string
}) => {
  if (!import.meta.env.SSR) {
    window.parent.postMessage(
      { type: 'close', id: id || btoa(JSON.stringify({ query: query })) },
      window.location.origin
    )
  }
}

export default defineComponent<
  {},
  { fetchPost: () => Promise<void> },
  { data: Data; loading: boolean }
>({
  name: 'Post',
  data() {
    return {
      loading: false,
      data: null as unknown as Data,
      error: null,
    }
  },
  created() {
    // watch the params of the route to fetch the data again
    this.fetchPost().then(() => {
      getTinaUpdates({
        cb: (newData) => {
          this.$data.data = {
            ...this.$data.data,
            data: newData,
          }
        },
        data: this.data.data,
        query: this.data.query,
        variables: this.data.variables,
      })
    })
  },
  unmounted() {
    closeTinaConnection({ query: this.data.query })
  },
  methods: {
    async fetchPost() {
      this.loading = true
      this.data = await client.queries.post({
        relativePath: 'hello-world.md',
      })
    },
  },
})
</script>
