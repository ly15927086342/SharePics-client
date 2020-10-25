<template>
  <div>
    <div id="vcomments"></div>
  </div>
</template>

<script>
  import Valine from 'valine';

  export default {
    name: 'Comment',
    props: {

    },
    data() {
      return {
        valine:null
      };
    },
    created(){
      console.log(1)
      this.valine = new Valine({
        el: '#vcomments',
        appId: 'rcY3qFIQJvpX88SKSmrKOcX5-gzGzoHsz',
        appKey: 'SUfYhtwcIs5CP5hxbK1AOh2a'
      })
    },
    methods: {

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
