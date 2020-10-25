<template>
  <div>
    <el-table :data="borrowbook" border style="width: 100%" v-loading="loading">
      <el-table-column type="index" width="50">
      </el-table-column>
      <el-table-column prop="title" label="待还书名" width="250">
      </el-table-column>
      <el-table-column prop="ISBN" label="ISBN" width="150">
      </el-table-column>
      <el-table-column prop="pos.room" label="机房" width="100">
      </el-table-column>
      <el-table-column prop="pos.floor" label="书架（层）" width="100">
      </el-table-column>
      <el-table-column prop="borrowtime" label="借出时间">
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right"> 
        <template slot-scope="scope">
          <el-button @click.native.prevent="returnBook(scope.$index)" type="text" size="medium">
            归还
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-alert title="请把图书归还到指定书架上，谢谢配合~" type="info" show-icon>
    </el-alert>
  </div>
</template>

<script>
  export default {
    name: 'Return',
    props: {

    },
    data() {
      return {
        currentDate: new Date(),
        borrowbook:[],
        loading:false
      };
    },
    created(){
      console.log(3)
      this.init();
    },
    methods: {
      returnBook(index){
        this.loading = true;
        this.axios.post(this.GLOBAL.ip+':'+this.GLOBAL.port+'/book/return',{
          ISBN:this.borrowbook[index].ISBN,
          user:this.GLOBAL.userName
        }).then(response=>{
          this.loading = false;
          if(response.data.code == 0){
            this.$message({
              type: 'success',
              message: '归还成功'
            });
            this.borrowbook.splice(index,1);
          }else{
            this.$message({
              type: 'warning',
              message: '归还失败'
            });
          }
        }).catch(err => {
          console.log(err)
        }) 
      },
      init(){
        this.loading = true;
        this.axios.get(this.GLOBAL.ip+':'+this.GLOBAL.port+'/user/history',{
          params:{
            user:this.GLOBAL.userName
          }          
        })
        .then(response=>{
          this.loading = false;
          this.borrowbook.splice(0,this.borrowbook.length);
          response.data.history.forEach(item=>{
            let date = new Date(item.borrowtime);
            let Y = date.getFullYear() + '-';
            let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
            let D = date.getDate() + ' ';
            item.borrowtime = Y + M + D;
            this.borrowbook.push(item);
          })
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

</style>