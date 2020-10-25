<template>
  <div id="app"> 
    <canvas v-show="!islogin" id="c"></canvas>
    <el-row :gutter="10">
      <el-col :xs="0" :sm="2" :md="3" :lg="4" :xl="5"><div class="grid-content"></div></el-col>
      <el-col :xs="24" :sm="20" :md="18" :lg="16" :xl="14">
        <el-container>
          <el-header style="height:61px;box-sizing: border-box;display: flex;flex-direction: row;" :class="notPC || !islogin ? phone : notphone">
            <div>
              <div style="font-family:Calibri;font-size: 40px;font-weight: bold" class="animated tdDropInRight">
                SharePics
                <!-- <img src="./assets/beta.png" style="width: 32px"> -->
              </div> 
            </div>
            <div v-if="islogin && !notPC" style="display: flex;flex-direction: row;align-items: center;justify-content: space-between;">
              <el-menu :default-active="activeName" class="el-menu-demo" mode="horizontal" router @select="handleSelect">     
                <el-menu-item index="/file">文件</el-menu-item>
                <el-menu-item index="/book">书籍</el-menu-item>
                <el-menu-item index="/people">成员</el-menu-item>
              </el-menu>  
              <el-divider direction="vertical"></el-divider>
              <el-link  v-if="islogin" :underline="false" @click="logout">
                <div>欢迎，{{getWelcome}}<i class="el-icon-right el-icon--right"></i>退出</div>
              </el-link>
            </div>  
          </el-header>      
          <el-main> 
            <div v-if="islogin && notPC" style="display: flex;flex-direction: row;align-items: center;justify-content: space-between;border-bottom: solid 1px #e6e6e6;box-sizing:border-box;">
              <el-menu :default-active="activeName" class="el-menu-demo" mode="horizontal" router @select="handleSelect">     
                <el-menu-item index="/file">文件</el-menu-item>
                <el-menu-item index="/book">书籍</el-menu-item>
                <el-menu-item index="/people">成员</el-menu-item>
              </el-menu>  
              <el-divider direction="vertical"></el-divider>
              <el-link  v-if="islogin" :underline="false" @click="logout">
                <div v-if="notPC"><i class="el-icon-right el-icon--right"></i>退出</div>
                <div v-else>欢迎，{{getWelcome}}<i class="el-icon-right el-icon--right"></i>退出</div>
              </el-link>
            </div> 
        <!--     <el-tabs v-model="activeName" @tab-click="handleClick">
              <el-tab-pane label="文件" name="file"></el-tab-pane>
              <el-tab-pane label="书籍" name="book"></el-tab-pane>
              <el-tab-pane label="成员" name="people"></el-tab-pane>
            </el-tabs>   -->    
            <div class="grid-content">
              <keep-alive :include="['People','Project']">
                <router-view @status="loginstatus" @unlogin="unlogin" :role="role"></router-view>
              </keep-alive>
            </div> 
          </el-main>
          <el-footer style="margin-top: 20px;font-size: 13px;color: #999">
            <div>&copy 武大城市化研究室</div>
            <div>DESIGNED BY LIYU</div>
          </el-footer>  
        </el-container>
      </el-col>
      <el-col :xs="0" :sm="2" :md="3" :lg="4" :xl="5">
        <div class="grid-content"></div>
      </el-col>
    </el-row> 
    <el-backtop></el-backtop>
  </div>
</template>

<script>
  import getCookie from './lib/getCookie';
  import setCookie from './lib/setCookie';
  import os from './plugins/basefuncs.js';
  // import ani from './lib/animate.js';

  export default {
    name: 'app',
    data(){
      return{
        islogin:false,
        activeName:'/file',
        lastTabName:'/file',
        userName:'',
        role:'',
        notphone:'notphone',
        phone:'phone',
        notPC:false
      }
    },
    computed:{
      getWelcome(){
        if(this.role == 'teacher'){
          return this.userName.substring(0,1)+'老师'
        }else if(this.role == 'student'){
          return this.userName.substring(0,1)+'同学'
        }else if(this.role == 'manager'){
          return this.userName +'管理员'
        }
      }
    },
    created(){//刷新
      if(os.isAndroid || os.isPhone){
        this.GLOBAL.notPC = true;
      }
      this.notPC = this.GLOBAL.notPC;
      if(['file','book','people','bookshelf','return','borrow','storage'].includes(this.$route.name)){
        let name = getCookie('userName');
        let role = getCookie('role');
        if(name){
          this.islogin = true;
          this.userName = name;
          this.role = role;
          this.GLOBAL.userName = name;
          this.GLOBAL.role = role;
        }
      }
      this.activeName = localStorage.getItem('activeName');
      this.lastTabName = localStorage.getItem('activeName');
    },
    methods:{
      handleSelect(index){
        localStorage.setItem('activeName',index);
      },
      unlogin(istrue){
        if(istrue){
          this.islogin = false;
        }
      },
      logout(){
        this.axios.post(this.GLOBAL.ip+':'+this.GLOBAL.port+'/user/logout',{
          name:this.userName
        })
        .then(response=>{
          if(response.data.code == 0){
            this.islogin = false;
            this.$router.push({name:'login'});
            setCookie('userName','');
            setCookie('role','');
          }
        }).catch(err=>{
          console.log(err);
        })  
      },
      loginstatus(log,name,role,isgrad){
        this.userName = name;
        this.role = role;
        this.GLOBAL.userName = name;
        this.GLOBAL.role = role;
        this.lastTabName = localStorage.getItem('activeName');
        this.activeName = localStorage.getItem('activeName');
        setCookie('userName',name);
        setCookie('role',role);
        this.islogin = log;
        if(this.islogin){
          this.$router.push({
            name:'file',
            params:{
              // user:this.userName
            }
          });
        }
      },
    },
    watch: {
      '$route' (to, from) {
        // 对路由变化作出响应...
        if(['file','book','people'].includes(to.name)){
          let name = getCookie('userName')
          if(name){
            this.islogin = true;
            this.userName = name;
          }
        }
      }
    },
  }


</script>

<style>
#app {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /*margin-top: 60px;*/
}

body{
  /*margin: 0;*/
}

.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.flex-row-between{
  display: flex;
  flex-direction: row; 
  align-items: center;
  justify-content: center;
}

.notphone{
  align-items: center;
  justify-content: space-between;
  border-bottom: solid 1px #e6e6e6;
}
.phone{
  align-items: center;
  justify-content: center;
}
</style>
