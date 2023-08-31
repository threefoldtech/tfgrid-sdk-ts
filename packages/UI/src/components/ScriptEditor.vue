<template>
  <form dest>
    <div class="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
      <div class="px-4 py-2 bg-white rounded-b-lg dark:bg-gray-800">
        <label for="editor" class="sr-only">Submit Script</label>
        <textarea
          id="editor"
          rows="8"
          class="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
          placeholder="Edit your script..."
          required
        ></textarea>
      </div>
    </div>
    <button
      type="submit"
      class="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
      @click="editScript"
    >
      Submit Script
    </button>
  </form>
</template>

<script lang="ts">
export default {
  name: "ScriptEditor",
  props: ["dest"],
  setup(props) {
    function editScript() {
      console.log(props.dest);
    }

    return {
      editScript,
    };
  },
};
</script>
