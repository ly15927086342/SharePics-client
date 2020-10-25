<template>
  <div style="display: flex;flex-direction: column;align-items: flex-start;justify-content: center;width: 100%;">
    <el-tag style="margin: 10px 0;">{{title}}</el-tag>
    <el-row :gutter=20 style="width: 100%">
      <el-col :span="notPC ? 8 : 3" v-for="(peo,index) in member">
        <div style="width: 100%;margin-bottom: 20px;">
          <img v-if="peo.sex=='男'" src="../../assets/男职.png"  class="head">
          <img v-else-if="peo.sex=='女'" src="../../assets/女职.png" class="head">
          <img v-else src="../../assets/头像.png" class="head"> 
          <div style="font-size: 13px;">{{peo.name}}</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
    name: 'memberview',
    props: {
      member:{
        type:Array,
        default:[]
      },
      title:{
        type:String,
        default:''
      },
      notPC:{
        type:Boolean,
        default:false
      }
    },
    data() {
      return {

      };
    },
    created(){

    },
    methods: {

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.head{
  width: 75%;
  height: 75%;
  border-radius: 10px;
  margin-bottom: 10px
}
.small_sex{
  width: 14px;
  height: 14px;
}
</style>
