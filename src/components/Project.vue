<template>
  <div class="hello" v-loading="loading">
    <div style="display: flex;flex-direction: row;align-items: center;justify-content: center; margin:10px 0 20px 0;min-height: 40px;">
      <el-tooltip effect="dark" content="创建文件夹" placement="top">
        <i style="font-size: 26px; color:#99a9bf;" class="el-icon-plus pointer" @click="confirmCreate" tool></i>
      </el-tooltip>
      <el-tooltip effect="dark" content="上传文件" placement="top">
        <el-upload ref="upload" :action="url" multiple :limit="101" :show-file-list="false" with-credentials :http-request="uploadfiles" :on-change="fileChange" :file-list="fileList" :on-exceed="overlimit">  
          <i style="font-size: 26px; color:#99a9bf;" class="el-icon-upload pointer" tool>
          </i> 
        </el-upload> 
      </el-tooltip>
      <el-tooltip effect="dark" content="刷新" placement="top">
        <i style="font-size: 26px; color:#99a9bf;" class="el-icon-refresh pointer" @click="refresh" tool></i>
      </el-tooltip>
      <el-tooltip v-if="showPic" effect="dark" content="列表模式" placement="top">
        <i style="font-size: 26px; color:#99a9bf;" class="el-icon-s-operation pointer" tool @click="changeStyle"></i>    
      </el-tooltip>
      <el-tooltip v-else effect="dark" content="缩略图模式" placement="top">
        <i style="font-size: 26px; color:#99a9bf;" class="el-icon-menu pointer" tool @click="changeStyle"></i>
      </el-tooltip>
    </div>
    <div>
      <el-form :inline="true"> 
        <el-form-item label="文件类型">
          <el-cascader style="width: 150px;" v-model="searchTag.type" :options="type_options" clearable></el-cascader>
        </el-form-item>
        <el-form-item label="文件后缀">
          <el-cascader style="width: 150px;" v-model="searchTag.suffix" :options="suffix_options" clearable></el-cascader>
        </el-form-item> 
        <el-form-item>
          <el-input v-model="searchTag.uploader" placeholder="上传者"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchTag.name" placeholder="文件名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchFiles">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-page-header style="margin: 10px 0" v-if="pathStack.length > 1" @back="goBack" :content="pathStack[pathStack.length-1]">
    </el-page-header>
    <div v-else style="text-align: left;margin: 10px 0;font-size: 18px;color: #303133" >
      首页
    </div>
    <el-row :gutter=20 v-if="showPic">
      <div v-if="FilterDirectory.length == 0" style="color: #999">
        <img src="https://media.tenor.com/images/c4ea5e592bdc4d76ce59c4b89551686d/tenor.gif">
      </div>
      <el-col :span="notPC ? 12 : 6" v-for="(file,index) in FilterDirectory">
        <div v-if="file.type == 'directory'" class="createcard pointer" style="position: relative;">
          <i class="el-icon-close dir_close" @click="deleteDir(index)"></i>
          <div class="flex-center" style="height: 140px;width: 100%"   @click="goToDir(index)">
            <div class="dir_pic">
              <img src="../assets/directory.jpg" style="height: auto;width: 120px;object-fit: cover;bottom: 0;position: absolute;left: 0">
            </div>
          </div>
          <div class="flex-center" style="height: 40px;width: 100%">
            <div class="fileName">{{file.name}}</div>
          </div>
        </div>
        <div v-else class="imgcard pointer">
          <div class="flex-center" style="height: 140px;width: 100%;" v-loading="file.loading">
            <div class="pic">
              <el-image v-if="['.png','.jpg','.jpeg'].includes(file.suffix.toLowerCase())" :src="file.url"  style="width: 100%;height: 100%;border-radius: 10px;" fit="contain" lazy></el-image>
              <div v-else class="flex-row-center" style="width: 100%;height: 100%;font-weight: bold;font-size: 50px;" lazy>{{file.suffix}}</div>
              <div class="hoverclass flex-row-center">
                <i class="el-icon-zoom-in" v-if="['.png','.jpg','.jpeg'].includes(file.suffix.toLowerCase())" @click="preview(index)" style="margin-right: 15px"></i> 
                <i class="el-icon-download" @click="download(index)" style="margin-right: 15px"></i>
                <i class="el-icon-delete" @click="deleteit(index)"></i>
              </div> 
            </div>
          </div>
          <div class="flex-center" style="height: 40px;width: 100%" :title="file.name">
            <div class="fileName">{{file.name}}</div>
          </div>
        </div>
      </el-col>
    </el-row>
    <div v-else>
      <el-table :data="FilterDirectory" style="width: 100%" @sort-change="sortChange">
        <el-table-column type="index" width="50">
        </el-table-column>
        <el-table-column prop="name" label="文件名">
        </el-table-column>
        <el-table-column prop="type" label="文件类型" width="100">
        </el-table-column>
        <el-table-column prop="suffix" label="后缀名" width="100">
        </el-table-column>
        <el-table-column prop="size" label="文件大小(b)" width="100">
        </el-table-column>
        <el-table-column prop="uploader" label="上传者" width="100">
        </el-table-column>
        <el-table-column prop="time" label="上传时间" width="100">
        </el-table-column>
        <el-table-column prop="downloadcount" label="下载次数" width="100">
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right"> 
          <template slot-scope="scope">
            <div v-if="scope.row.type == 'directory'" >
              <el-button type="text" size="medium" @click="goToDir(scope.$index)">打开</el-button>
              <el-button type="text" size="medium" @click="deleteDir(scope.$index)">删除</el-button>
            </div>
            <div v-else>
              <el-button  v-if="['.png','.jpg','.jpeg'].includes(scope.row.suffix.toLowerCase())" @click.native.prevent="preview(scope.$index)" type="text" size="medium" >预览</el-button>
              <el-button @click.native.prevent="download(scope.$index)" type="text" size="medium">
                下载
              </el-button>
              <el-button @click.native.prevent="deleteit(scope.$index)" type="text" size="medium">
                删除
              </el-button>
            </div>          
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog :visible.sync="dialogVisible">
      <img v-if="FilterDirectory.length > 0 && FilterDirectory[chooseIndex].type == 'file' && ['.png','.jpg','.jpeg'].includes(FilterDirectory[chooseIndex].suffix.toLowerCase())" width="100%" :src="getUrl" alt="">
    </el-dialog>
    <iframe name="iframeId" style="display:none"></iframe>
    <div class="block">
      <el-pagination :current-page="cur_page" layout="prev, pager, next, jumper" :total="total_page" background @current-change="pageChange" :page-size="pageNum">
      </el-pagination>
    </div>
  </div>
</template>

<script>


  export default {
    name: 'Project',
    props: {

    },
    data() {
      return {
        url:this.GLOBAL.ip+':'+this.GLOBAL.port+'/file/upload/',
        input:'',
        search:'',
        directory:[],
        pathStack:['/'],
        notPC:false,
        fileList:[],
        chooseIndex:0,
        dialogVisible:false,
        isshowSearch:false,
        filterStr:'',
        typeIndex:0,
        loading:false,
        showPic:true,
        pageNum:40,
        cur_page:1,
        total_page:1,
        searchTag:{
          type:'',
          suffix:'',
          uploader:'',
          name:''
        },
        type_options:[{
          value:'directory',
          label:'文件夹'
        },
        {
          value:'file',
          label:'文件'
        }
        ],
        suffix_options:[
        {
          value:'.png',
          label:'.png'
        },{
          value:'.jpg',
          label:'.jpg'
        },{
          value:'.jpeg',
          label:'.jpeg'
        },{
          value:'.rar',
          label:'.rar'
        },{
          value:'.zip',
          label:'.zip'
        },{
          value:'.pdf',
          label:'.pdf'
        },{
          value:'.docx',
          label:'.docx'
        },{
          value:'.pptx',
          label:'.pptx'
        },{
          value:'.xlsx',
          label:'.xlsx'
        },{
          value:'.vsdx',
          label:'.vsdx'
        }]
      };
    },
    created(){
      this.notPC = this.GLOBAL.notPC;
      this.init(this.pathStack.join(''));
    },
    // 使用directives注册v-focus全局指令
    directives: {
      focus: {
        inserted: function (el) {
          el.querySelector('input').focus()
        }
      }
    },
    computed:{
      getUrl(){
        let a = this.FilterDirectory[this.chooseIndex].url;
        let b = a.replace('Thumbnail','Storage');
        return b;
      },
      FilterDirectory(){
        return this.directory.filter(item=>{
          if(this.filterStr == ""){
            return item.name.includes(this.search);
          }else{
            if(this.filterStr == 'directory'){
              return item.name.includes(this.search) && item.type == this.filterStr;
            }else{
              if(item.type == 'file'){
                return item.name.includes(this.search) && item.suffix.toLowerCase() == this.filterStr;
              }              
            }            
          }          
        })
      },
      types(){
        let check = {};
        let res = ['全部'];
        for(let i of this.directory){
          if(i.type == 'directory'){
            if(!check[i.type]){
              res.push(i.type);
              check[i.type] = 1;        
            }
          }else{//文件
            let ty = i.suffix.toLowerCase();
            if(!check[ty]){
              res.push(ty);
              check[ty] = 1;
            }
          }
        }
        return res;
      }
    },
    methods: {
      searchFiles(){
        this.init(this.pathStack.join(''));
      },
      sortChange(res){
        console.log(res);
      },
      changeStyle(){
        this.showPic = !this.showPic;
      },
      overlimit(files,fileList){
        this.$message({
          type: 'warning',
          message: '文件数超过100'
        });
      },
      chooseType(index){
        this.typeIndex = index;
        if(index == 0){
          this.filterStr = '';
        }else{
          this.filterStr = this.types[index];
        }        
      },
      loseCur(e){
        this.isshowSearch = this.search === "" ? false : true;
      },
      searchIt(){
        this.isshowSearch = !this.isshowSearch;
      },
      deleteDir(index){
        this.$confirm('此操作将永久删除该文件夹, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if(!['manager'].includes(this.GLOBAL.role) && this.FilterDirectory[index].uploader != this.GLOBAL.userName){
            this.$message({
              type: 'danger',
              message: '您没有删除权限'
            });
            return;
          }
          this.axios.delete(this.GLOBAL.ip+':'+this.GLOBAL.port+'/directory/delete/'+this.FilterDirectory[index].name+'?path='+this.pathStack.join('')+'&user='+this.GLOBAL.userName)
          .then(response=>{
          if(response.data.code == 0){//删除成功
            let indexD = this.directory.findIndex(item=>{
              return this.FilterDirectory[index].name == item.name && this.FilterDirectory[index].type == item.type;
            });
            this.directory.splice(indexD,1);
            this.$message({
              type: 'success',
              message: '已删除'
            });
          }else{
            this.$message({
              type: 'warning',
              message: '删除失败'
            });
          } 
        })
          .catch(err => {
            console.log(err)
          })   
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      deleteit(index){
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if(!['manager','teacher'].includes(this.GLOBAL.role) && this.FilterDirectory[index].uploader != this.GLOBAL.userName){
            this.$message({
              type: 'danger',
              message: '你没有删除权限'
            });
            return;
          }
          this.axios.delete(this.GLOBAL.ip+':'+this.GLOBAL.port+'/file/delete/'+this.FilterDirectory[index].name+'?path='+this.pathStack.join('')+'&user='+this.GLOBAL.userName)
          .then(response=>{
          if(response.data.code == 0){//删除成功
            let indexD = this.directory.findIndex(item=>{return this.FilterDirectory[index].name == item.name && this.FilterDirectory[index].type == item.type;});
            this.directory.splice(indexD,1);
            this.$message({
              type: 'success',
              message: '已删除'
            });
            this.init(this.pathStack.join(''));
          }else{
            this.$message({
              type: 'warning',
              message: '删除失败'
            });
          } 
        })
          .catch(err => {
            console.log(err)
          })   
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      download(index){
        window.open(this.GLOBAL.ip+':'+this.GLOBAL.port+'/file/download/'+this.FilterDirectory[index].name+'?path='+this.pathStack.join('')+'&user='+this.GLOBAL.userName, 'iframeId');
        this.directory[index].downloadcount++;
      },
      preview(index){
        this.chooseIndex = index;
        this.dialogVisible = true;
      },
      fileChange(file){
        if(file.status == 'ready'){
          this.$refs.upload.clearFiles()
          this.fileList = [{name: file.name, url: file.url}]
        }        
      },
      uploadfiles(f){
        let param = new FormData();
        param.append('file',f.file);
        param.append('pathname',this.pathStack.join(''));
        param.append('user',this.GLOBAL.userName);
        let config = {
          headers:{'Content-Type':'multipart/form-data'}
        };
        let index = this.FilterDirectory.findIndex(item=>{return item.name == f.file.name});
        if(index > -1){
          this.$message({
            type: 'warning',
            message: '已存在同名文件！'
          });
          return
        }
        let date = new Date();
        let Y = date.getFullYear() + '-';
        let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        let D = date.getDate() + ' ';
        this.directory.unshift({
          type:'file',
          suffix:f.file.name.substring(f.file.name.lastIndexOf('.')),
          size:f.file.size,
          uploader:this.GLOBAL.userName,
          name:f.file.name,
          time:Y+M+D,
          loading:true,
          url:'',
          downloadcount:0
        })
        this.axios.post(f.action,param,config)
        .then(response=>{
          let index = this.directory.findIndex(item=>{return item.name == response.data.res[0].name});
          if(['.png','.jpg','.jpeg'].includes(f.file.name.substring(f.file.name.lastIndexOf('.')).toLowerCase())){
            this.directory[index].url = response.data.res[0].url;
          } 
          delete f.file   
          // this.init(this.pathStack.join(''));
          this.directory[index].loading = false;  
        })
        .catch(({err}) => {
          f.onError()
        })   
      },
      pageChange(pg){
        this.cur_page = pg;
        this.refresh();
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      },
      goBack(){
        this.pathStack.pop();
        this.cur_page = 1;
        this.init(this.pathStack.join(''));
      },
      goToDir(index){
        this.cur_page = 1;
        this.pathStack.push(this.FilterDirectory[index].name+'/');
        this.init(this.pathStack.join(''));
      },
      refresh(){
        this.init(this.pathStack.join(''));
      },
      init(path){
        this.loading = true;
        this.axios.post(this.GLOBAL.ip+':'+this.GLOBAL.port+'/file/getAll',{
          path:path,
          index:this.cur_page - 1,
          num:this.pageNum,
          name:this.searchTag.name,
          uploader:this.searchTag.uploader,
          suffix:this.searchTag.suffix,
          type:this.searchTag.type
        }).then(res=>{
          this.total_page = res.data.len;
          console.log(this.total_page)
          console.log(this.cur_page)
          this.chooseIndex = 0;
          this.dialogVisible = false;
          this.isshowSearch = false;
          this.filterStr = '';
          this.typeIndex = 0;
          this.search = '';
          this.directory.splice(0,this.directory.length);
          res.data.res.forEach(item=>{
            let date = new Date(item.uploadtime);
            let Y = date.getFullYear() + '-';
            let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
            let D = date.getDate() + ' ';
            item.time = Y+M+D;
            item.loading = false;
            this.directory.push(item);
          })
          this.chooseIndex = 0;
          this.loading = false;
        }).catch(err=>{
          console.log(err);
        })
      },
      confirmCreate(){
        this.$prompt('请输入文件夹名', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(({ value }) => {
          if(value === null){
            this.$message({
              type: 'info',
              message: '未输入名称'
            });   
            return
          }
          this.axios.post(this.GLOBAL.ip+':'+this.GLOBAL.port+'/directory/create',{
            name: value,
            path:this.pathStack.join(''),
            user:this.GLOBAL.userName
          }).then(res=>{
            if(res.data.res){
              this.$message({
                type: 'success',
                message: '创建成功！'
              });
              let date = new Date();
              let Y = date.getFullYear() + '-';
              let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
              let D = date.getDate() + ' ';
              this.directory.unshift({
                name:value,
                type:'directory',
                time:Y+M+D,
                uploader:this.GLOBAL.userName
              })
              // this.init(this.pathStack.join(''));
            }else{
              this.$message({
                type: 'fail',
                message: '已存在同名项目！'
              });
            }
          }).catch(err=>{
            console.log(err);
          })
        }).catch(() => {
          // this.$message({
          //   type: 'info',
          //   message: '取消输入'
          // });       
        });
      },
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.createcard{
  height: 180px;
  vertical-align: middle;
  box-sizing: border-box;
}

.createcard:hover > i.dir_close{
  opacity: 1;
}

.dir_close{
  color: #999;
  right: 0;
  top: 0;
  position: absolute;
  opacity: 0;
  font-size: 20px;
  transition: opacity .3s;
  z-index: 5;
}

.flex-center{
  display: flex;
  flex-direction: column; 
  align-items: center;
  justify-content: center;
}

.flex-row-center{
  display: flex;
  flex-direction: row; 
  align-items: center;
  justify-content: center;
}

.flex-row-end{
  display: flex;
  flex-direction: row; 
  align-items: flex-start;
  justify-content: flex-end;
}

.imgcard{
  display: flex;
  flex-direction: column; 
  align-items: center;
  justify-content: flex-end;
  height: 180px;
  vertical-align: middle;
  box-sizing: border-box;
}

input{
  text-align: center;
  font-size: 15px;
  width: 80%;
  border-color: rgba(0,0,0,0);
  /*padding: 0 15px;*/
}
input:focus { outline: none; } 

.directory{
  background-image: url(../assets/directory.jpg);
  background-size:100% auto;
  background-position: center;
  background-repeat: no-repeat;
}

.pointer{
  cursor: pointer;
}

.fileName{
  /*max-width: 120px;*/
  width: 90%;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.el-tooltip:not(:last-child){
  margin-right: 10px;
}

.pic{
  height: 120px;
  width: 120px;
  object-fit: cover;
  border-radius: 10px;
  position: relative;
}

.dir_pic{
  height: 120px;
  width: 120px;
  object-fit: cover;
  border-radius: 10px;
  position: relative;
}

.pic:hover{
  box-shadow: 0 0 8px 0 rgba(232,237,250,.6);
}

.hoverclass{
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  color: #fff;
  opacity: 0;
  font-size: 20px;
  background-color: rgba(0,0,0,.5);
  transition: opacity .3s;
  border-radius: 10px;
}

.hoverclass:hover{
  opacity: 1;
}

.dir_hoverclass{
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  color: #fff;
  opacity: 0;
  font-size: 20px;
  /*background-color: rgba(0,0,0,.5);*/
  transition: opacity .3s;
  border-radius: 10px;
}

.dir_hoverclass:hover{
  opacity: 1;
}

.block{
  margin-top: 20px;
}
</style>
