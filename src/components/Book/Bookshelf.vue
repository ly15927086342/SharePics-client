<template>
  <div>
    <div>
      <el-form :inline="true"> 
        <el-form-item label="位置">
          <el-cascader style="width: 150px;" v-model="tags[0].data" :options="pos_options"clearable></el-cascader>
        </el-form-item>
        <el-form-item label="标签">
          <el-cascader style="width: 150px;" v-model="tags[1].data" :options="tab_options" clearable></el-cascader>
        </el-form-item> 
        <el-form-item label="地域">
          <el-select style="width: 150px;" v-model="tags[2].data" placeholder="请选择" clearable>
            <el-option v-for="item in city" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>    
        <el-form-item>
          <el-input v-model="tags[3].data" placeholder="输入书名或ISBN" @keyup.enter.native="searchIt"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchIt">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-loading="loading">    
      <div v-for="(item,index) in book">
        <div style="display: flex;flex-direction: row;padding: 0 20px;font-size: 13px;align-items: center;justify-content: space-between;">
          <div style="margin-right: 20px;">
            <el-image :src="item.url" style="width: 90px;height: auto;" fit="contain" lazy></el-image>
          </div>
          <div style="display: flex;flex-direction: column;align-items: flex-start;padding: 5px 0;flex:1;">
            <div style="line-height: 2;font-weight: bold;">{{item.title}}</div>
            <el-tag type="success" size="small" v-if="!(item.history.length > 0 && item.history[0].returntime == null)">在书架上</el-tag>
            <el-tag type="warning" size="small" v-else>被{{item.history[0].name}}借走</el-tag>
            <div style="color: #333;line-height: 1.5;margin-top: 5px;">{{item.author}} / {{item.ISBN}}</div>
            <div style="color: #333;line-height: 1.5;">{{item.pos.room}}书架{{item.pos.floor}}层 / {{item.tab.first}}-{{item.tab.second}} / {{item.city.join('、')}}</div>
            <div style="margin-top:5px;color:#666;line-height: 1.5; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">{{item.summary}}</div>            
          </div>
          <div style="margin-left: 20px;">
            <el-button size="medium" @click="borrow(index)" :disabled="item.history.length > 0 && item.history[0].returntime == null">借阅</el-button>
          </div>
        </div>
        <el-divider></el-divider>
      </div> 
      <div v-if="book.length == 0" style="color: #999">
        <img src="https://media.tenor.com/images/c4ea5e592bdc4d76ce59c4b89551686d/tenor.gif">
      </div>
      <div class="block">
        <el-pagination :current-page="cur_page" layout="prev, pager, next, jumper" :total="total_page" background @current-change="pageChange" :page-size="pageNum">
        </el-pagination>
      </div>
    </div>         
  </div>
</template>

<script>
  export default {
    name: 'Bookshelf',
    props: {

    },
    data() {
      return {
        loading:false,
        book:[],
        city:[],
        tab_options:[],
        pos_options:[],
        tags:[{
          type:'pos',
          data:[]
        },{
          type:'tab',
          data:[]
        },{
          type:'city',
          data:''
        },{
          type:'search',
          data:''
        }],
        cur_page:1,
        total_page:1,
        pageNum:10
      };
    },
    created(){
      console.log(1)
      this.city = this.GLOBAL.city;
      this.tab_options = this.GLOBAL.tab_options;
      this.pos_options = this.GLOBAL.pos_options;
      this.init();
    },
    methods: {
      borrow(index){
        this.loading = true;
        this.axios.post(this.GLOBAL.ip+':'+this.GLOBAL.port+'/book/borrow',{
          ISBN: this.book[index].ISBN,
          user: this.GLOBAL.userName,
          title:this.book[index].title,
          pos:this.book[index].pos
        })
        .then(response=>{
          this.loading = false;
          if(response.data.code == 0){
            this.$message({
              type: 'success',
              message: '借阅成功'
            });
            this.book[index].history.unshift(response.data.res);
          }else if(response.data.code == 1){
            this.$message({
              type: 'warning',
              message: '该书已被'+response.data.res+'借阅'
            });
          }
        })
        .catch(err => {
          console.log(err)
        })  
      },
      pageChange(pg){
        this.cur_page = pg;
        this.searchBook(this.tags[0].data,this.tags[1].data,this.tags[2].data,this.tags[3].data,this.cur_page-1);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      },
      init(){
        this.searchBook(this.tags[0].data,this.tags[1].data,this.tags[2].data,this.tags[3].data,this.cur_page-1);
      },
      searchBook(param_pos,param_tag,param_city,param_filter,param_page){
        this.loading = true;
        this.axios.get(this.GLOBAL.ip+':'+this.GLOBAL.port+'/book/search',{
          params:{
            query:JSON.stringify({
              pos:param_pos,
              tag:param_tag,
              city:param_city,
              filter:param_filter,
              page:param_page
            })
          }         
        })
        .then(response=>{
          this.total_page = response.data.len;
          console.log(this.total_page)
          this.book.splice(0,this.book.length);
          response.data.res.forEach(item=>{
            this.book.push(item);
          });
          if(response.data.res.length == 0){
            this.$message({
              type: 'success',
              message: '无匹配书籍'
            });
          }
          this.loading = false;
        })
        .catch(err => {
          console.log(err)
        })  
      },
      searchIt(){
        console.log(this.tags)
        this.searchBook(this.tags[0].data,this.tags[1].data,this.tags[2].data,this.tags[3].data,0);
      },
      showBooks(room,floor){
        console.log(room,floor);

      },
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-form-item{
  /*width: 200px;*/
}
</style>