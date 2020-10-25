<template>
  <div v-loading="loading">
    <memberview :member="teacher" :notPC="notPC" :title="title[0]"></memberview>
    <!-- <el-divider></el-divider> -->
    <memberview :member="manager" :notPC="notPC" :title="title[1]"></memberview>
    <!-- <el-divider></el-divider> -->
    <memberview :member="member" :notPC="notPC" :title="title[2]"></memberview>
  </div>
</template>

<script>
  import os from '../plugins/basefuncs.js'
  import memberview from './People/member.vue'

  export default {
    name: 'People',
    components:{
      memberview
    },
    props: {

    },
    data() {
      return {
        teacher:[],
        manager:[],
        member:[],
        notPC:false,
        loading:false,
        title:['Boss','图书管理员','成员']
      };
    },
    created(){
      // console.log(this.$route.params);
      if(os.isAndroid || os.isPhone){
        this.notPC = true;
      }
      this.init();
    },
    methods: {
      init(){
        this.loading = true;
        this.axios.get(this.GLOBAL.ip+':'+this.GLOBAL.port+'/user/getAll',{
          user:this.GLOBAL.userName
        })
        .then(response=>{
          this.teacher.splice(0,this.teacher.length);
          this.manager.splice(0,this.manager.length);
          this.member.splice(0,this.member.length);
          response.data.users.forEach(item=>{
            if(item.role == 'teacher'){
              this.teacher.push(item);
            }else if(item.role == 'manager'){
              this.manager.push(item);
            }else if(item.role == 'student'){
              this.member.push(item);
            }
          })
          this.loading = false
        })
        .catch(err => {
          console.log(err)
        })   
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.flex-row-end{
  display: flex;
  flex-direction: row; 
  align-items: flex-start;
  justify-content: flex-end;
}
.flex-center{
  display: flex;
  flex-direction: column; 
  align-items: center;
  justify-content: center;
}
.dir_pic{
  height: 120px;
  width: 120px;
  object-fit: cover;
  border-radius: 10px;
  position: relative;
}
.createcard{
  height: 180px;
  vertical-align: middle;
  box-sizing: border-box;
}
</style>
