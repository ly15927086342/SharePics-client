<template>
  <div>
    <div style="display: flex;flex-direction: row;align-items: center;justify-content: center; margin:10px 0 20px 0;min-height: 40px;">
      <el-tooltip effect="dark" content="书架" placement="top">
        <i :class="lastIndex == 1? activeTitle : normalTitle" style="font-size: 26px;" class="el-icon-notebook-2 pointer" @click="goTo(1)" tool></i>
      </el-tooltip>
      <el-tooltip effect="dark" content="归还" placement="top">
        <i :class="lastIndex == 2? activeTitle : normalTitle" style="font-size: 26px;" class="el-icon-remove pointer" @click="goTo(2)" tool></i>
      </el-tooltip>
      <el-tooltip v-if="ismanager" effect="dark" content="入库" placement="top">
        <i :class="lastIndex == 3? activeTitle : normalTitle" style="font-size: 26px;" class="el-icon-document-add pointer" @click="goTo(3)" tool></i>
      </el-tooltip>
    </div>
    <keep-alive :include="['Storage']">
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
  export default {
    name: 'Book',
    props: {
      role:{
        type:String,
        default:''
      }
    },
    data() {
      return {
        ismanager:false,
        lastIndex:1,
        activeTitle:'activeTitle',
        normalTitle:'normalTitle'
      };
    },
    created(){
      console.log('root')
      this.ismanager = this.role == 'manager';
      if(this.$route.name == 'bookshelf'){
        this.lastIndex = 1
      }else if(this.$route.name == 'return'){
        this.lastIndex = 2
      }else if(this.$route.name == 'storage'){
        this.lastIndex = 3
      }
    },
    methods: {
      goTo(index){
        if(index == this.lastIndex){
          return
        }
        this.lastIndex = index;
        switch(index){
          case 1:
          this.$router.push({name:'bookshelf'});
          break;
          case 2:
          this.$router.push({name:'return'});
          break;
          case 3:
          this.$router.push({name:'storage'});
          break;
          default:
          break;
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-tooltip:not(:last-child){
  margin-right: 10px;
}
.pointer{
  cursor: pointer;
}

.activeTitle{
  color: #2c3e50;
}

.normalTitle{
  color:#99a9bf;
}
</style>
