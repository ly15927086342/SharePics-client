<template>
	<div el-row :gutter="10">
		<el-col :xs="0" :sm="2" :md="4" :lg="6" :xl="6"><div class="grid-content"></div></el-col>
		<el-col :xs="24" :sm="20" :md="16" :lg="12" :xl="12">
			<div class="grid-content">
				<el-tabs v-model="activeName" type="border-card">
					<el-tab-pane label="登录" name="login">
						<el-form :label-position="labelPosition" label-width="80px" :model="logincard">
							<el-form-item label="姓名">
								<el-input v-model="logincard.name"></el-input>
							</el-form-item>
							<el-form-item label="密码">
								<el-input v-model="logincard.password" show-password></el-input>
							</el-form-item>
						</el-form>
						<el-button type="primary" size="default" @click="login">登录</el-button>
					</el-tab-pane>
					<el-tab-pane label="注册" name="register">
						<el-form :label-position="labelPosition" label-width="80px" :model="registercard">
							<el-form-item label="真实姓名">
								<el-input v-model="registercard.name"></el-input>
							</el-form-item>
							<el-form-item label="密码">
								<el-input v-model="registercard.password" show-password></el-input>
							</el-form-item>
							<el-form-item label="确认密码">
								<el-input v-model="registercard.confirmpassword" show-password></el-input>
							</el-form-item>
							<el-form-item label="性别">
								<el-radio v-model="registercard.sex" label="男">男</el-radio>
							<el-radio v-model="registercard.sex" label="女">女</el-radio>
							</el-form-item>							
						</el-form>
						<el-button type="primary" size="default" @click="register">注册</el-button>
					</el-tab-pane>
				</el-tabs>
			</div>
			<div style="text-align: left;margin-top: 30px;font-size: 13px;color: #999;line-height: 1.5;">平台说明：</br>
			该平台的功能是共享文件（各种类型）和图书管理（查询、借阅、入库），仅限武大城市化研究室内网使用，即美食城四楼网线上网或wteam-xlab wifi上网可以访问。</br>
			该平台仅供WKS-family成员使用，每个人仅能注册一次，如果忘记密码，请询问李煜。</br>
			如发现bug或有任何建议，请及时反馈。
		</div>
		</el-col>
		<el-col :xs="0" :sm="2" :md="4" :lg="6" :xl="6"><div class="grid-content"></div></el-col>	
	</div>
</template>

<script>
	export default {
		name: 'Login',
		props: {

		},
		data() {
			return {
				activeName:'login',
				labelPosition: 'right',
				logincard: {
					name: '',
					password:''
				},
				registercard: {
					name: '',
					password:'',
					confirmpassword:'',
					sex:'男'
				}
			};
		},
		created(){
			console.log(this.$route.params);
			this.init();
		},
		methods: {
			init(){
				this.$emit('unlogin',true);
			},
			login(){
				this.axios.post(this.GLOBAL.ip+':'+this.GLOBAL.port+'/user/login',{
					name:this.logincard.name,
					password:this.logincard.password
				})
				.then(response=>{
					if(response.data.code == 0){
						localStorage.setItem('activeName','/file');
						this.$emit("status",true,this.logincard.name,response.data.info.role,response.data.info.isgraduate);
					}else if([1,2].includes(response.data.code)){
						this.$message({
							type: 'warning',
							message: response.data.msg
						});
					}
				}).catch(err=>{
					console.log(err);
				})				
			},
			register(){
				if(this.registercard.password == ""){
					this.$message({
						type: 'warning',
						message: '密码不能为空'
					});
					return
				}
				if(this.registercard.password != this.registercard.confirmpassword){
					this.$message({
						type: 'warning',
						message: '密码不一致'
					});
					return
				}			
				this.axios.post(this.GLOBAL.ip+':'+this.GLOBAL.port+'/user/register',{
					name:this.registercard.name,
					password:this.registercard.password,
					sex:this.registercard.sex
				})
				.then(response=>{
					if(response.data.code == 1){
						this.$message({
							type: 'warning',
							message: '您已注册过，请直接登录。如需修改密码，请直接联系管理员。'
						});
						this.activeName = 'login';
					}else if(response.data.code == 0){
						this.$message({
							type: 'success',
							message: '注册成功，请登录'
						});
						this.activeName = 'login';
					}else if(response.data.code == 2){
						this.$message({
							type: 'warning',
							message: '您暂不在数据库名单内，如有遗漏，请联系管理员。'
						});
					}
				}).catch(err=>{
					console.log(err);
				})	
			}
		}
	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.grid-content {
	border-radius: 4px;
	min-height: 36px;
}
</style>
