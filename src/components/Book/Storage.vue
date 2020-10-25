<template>
  <div>
    <el-form :inline="true">
      <el-alert title="由于豆瓣API被封，根据ISBN查询书籍信息的功能暂不可用" type="warning">
      </el-alert>
    </el-form>
    <el-form :inline="true">
      <el-form-item>
        <el-link :underline="false" type="primary" @click="dialogVisible = true">入库说明</el-link>
      </el-form-item>
    </el-form>
    <el-form ref="form" :model="form" label-width="80px" v-loading="loading">
      <el-form-item label="书名" :rules="[{ required: true, message: '请输入书名', trigger: 'blur' }]">
        <el-input v-model="form.title"></el-input>
      </el-form-item>
      <el-form-item label="ISBN">
        <el-input v-model="form.ISBN"></el-input>
      </el-form-item>
      <el-form-item label="作者">
        <el-input v-model="form.author"></el-input>
      </el-form-item>
      <el-form-item label="简介">
        <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入内容" v-model="form.summary">
        </el-input>
      </el-form-item>
      <el-form-item label="地域">
        <el-select v-model="form.city" multiple placeholder="请选择">
          <el-option v-for="item in city" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="标签":rules="[{ required: true, message: '请选择标签', trigger: 'blur' }]">
        <el-cascader v-model="form.tab" :options="tab_options" @change="choosetab"></el-cascader>
      </el-form-item>
      <el-form-item label="上架":rules="[{ required: true, message: '请选择上架的位置', trigger: 'blur' }]">
        <el-cascader v-model="form.pos" :options="pos_options" @change="choosepos"></el-cascader>
      </el-form-item>
      <el-form-item label="封面">
        <el-upload :action="upimgURL" :show-file-list="false" :on-success="upsus">
          <img v-if="form.url" :src="form.url" class="avatar" style="border: 1px dashed #d9d9d9;border-radius: 6px;cursor: pointer;position: relative;overflow: hidden;">
          <i v-else class="el-icon-plus avatar-uploader-icon" style="border: 1px dashed #d9d9d9;border-radius: 6px;cursor: pointer;position: relative;overflow: hidden;"></i>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="pushIntoStorage">入库</el-button>
      </el-form-item>
    </el-form>
    <el-dialog title="入库说明" :visible.sync="dialogVisible" style="text-align: left;" :width="calwidth">
      <span>1. 手动输入书籍的ISBN码（条形码，一般是978开头），点击查询</br></span>
      <span>2. 如果查询成功，默认会填写书名、ISBN、作者、简介和封面</br></span>
      <span>3. 如果查询失败，则需手动填写必填项（书名、标签、上架是必填项），完整更好</br></span>
      <span>4. 如果没有封面，可以用手机拍摄上传</br></span>
      <span>5. 城市文化类书籍需要填地域项</br></span>
      <span>6. 如果对标签有疑问，可以提出</br></span>
      <span>7. 428书架目前每一层对应标签是：5层专业类、4层图集、3层设计类和工具类、2层和1层：城市文化，层数从下往上依次增大</br></span>
      <span>8. 如果发现书籍入库信息有误，请通知李煜</br></span>
      <span>9. 有疑问及时沟通</br></span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">已阅</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Storage',
    props: {

    },
    data() {
      return {
        upimgURL:this.GLOBAL.ip+':'+this.GLOBAL.port+'/storage/uploadIMG/',
        loading:false,
        city:[],
        tab_options:[],
        pos_options:[],
        ISBN:'',
        form:{
          title:'',
          author:'',
          tab:[],
          url:'',
          ISBN:'',
          pos:[],
          summary:'',
          city:[]
        },
        inputVisible: false,
        inputValue: '',
        dialogVisible: false,
        notPC:false
      };
    },
    created(){
      console.log(4)
      this.city = this.GLOBAL.city;
      this.tab_options = this.GLOBAL.tab_options;
      this.pos_options = this.GLOBAL.pos_options;
      this.notPC = this.GLOBAL.notPC;
    },
    computed:{
      calwidth(){
        return this.notPC ? '80%' : '30%';
      }
    },
    methods: {
      upsus(res){
        if(res.code == 0){
          this.form.url = res.url;
        }else if(res.code == 1){
          this.$message({
            type: 'warning',
            message: '封面上传失败'
          });
        }
      },
      pushIntoStorage(){
        console.log(this.form)
        if(this.form.tab.length == 0){
          this.$message({
            type: 'warning',
            message: '未选标签'
          });
          return
        }
        if(this.form.pos.length == 0){
          this.$message({
            type: 'warning',
            message: '未选上架位置'
          });
          return
        }
        if(this.form.title == ""){
          this.$message({
            type: 'warning',
            message: '未输入书名'
          });
          return
        }
        console.log(this.form)
        let data = this.form;
        data.uploader = this.GLOBAL.userName;
        this.axios.post(this.GLOBAL.ip+':'+this.GLOBAL.port+'/storage/push',{
          data:data
        })
        .then(response=>{
          if(response.data == 0){//入库成功
            this.$message({
              type: 'success',
              message: '入库成功'
            });
            this.ISBN = "";
            this.form.ISBN = "";
            this.form.title = "";
            this.form.summary = "";
            this.form.author = "";
            console.log(this.form)
          }else if(response.data == 1){//入库失败
            this.$message({
              type: 'warning',
              message: '该书已入库'
            });
            this.form.ISBN = "";
            this.form.title = "";
            this.form.summary = "";
            this.form.author = "";
          }
        })
        .catch(err => {
          console.log(err)
        })  
      },
      choosetab(value){
        console.log(value)
      },
      choosepos(value){
        console.log(value)
      },
      searchIt(){
        this.loading = true;
        if(this.ISBN == ''){
          this.$message({
            type: 'warning',
            message: '未输入ISBN'
          });
          return
        }
        this.axios.post(this.GLOBAL.ip+':'+this.GLOBAL.port+'/storage/search',{
          ISBN:this.ISBN
        })
        .then(response=>{
          if(response.data.code == 0){
            this.form.title = response.data.res.title;
            this.form.url = response.data.res.url;
            this.form.author = response.data.res.author.join(' ');
            this.form.summary = response.data.res.summary;
            // response.data.res.tab.forEach(item=>{
            //   this.form.tab.push(item);
            // })
            // this.form.tab = response.data.res.tab.join(' ');
            this.form.ISBN = this.ISBN;
          }else if(response.data.code == 1){
            this.$message({
              type: 'warning',
              message: '查不到该ISBN对应的书目'
            });
          }
          this.loading = false;
        })
        .catch(err => {
          console.log(err)
        })  
      },
      handleClose(tag) {
        this.form.tab.splice(this.form.tab.indexOf(tag), 1);
      },
      showInput() {
        this.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      handleInputConfirm() {
        let inputValue = this.inputValue;
        if (inputValue) {
          this.form.tab.push(inputValue);
        }
        this.inputVisible = false;
        this.inputValue = '';
      }
    }
  }
</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}

.el-cascader{
  width: 100%;
}

.el-select{
  width: 100%;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>