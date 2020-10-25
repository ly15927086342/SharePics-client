import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'
import config from './config.js'
import VueRouter from 'vue-router'
import Book from './components/Book.vue'
import Project from './components/Project.vue'
import People from './components/People.vue'
import Login from './components/Login.vue'
import Bookshelf from './components/Book/Bookshelf.vue'
import Return from './components/Book/Return.vue'
import Storage from './components/Book/Storage.vue'
import axios from 'axios'
import getCookie from './lib/getCookie';
import setCookie from './lib/setCookie';

axios.defaults.baseURL = 'http://'+config.ip+':'+config.port;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

axios.interceptors.request.use(function (config) {
	config.withCredentials = true;
	return config;
}, function (error) {
	return Promise.reject(error);
})

axios.interceptors.response.use(res=>{
	return res;
},function(error){
	switch(error.response.status){
		case 403:
		router.replace({                    
			name:'login'                 
		});   
		setCookie('userName','');
		setCookie('role','');
		break;
		default:break;
	}
	return Promise.reject(error);
})

Vue.config.productionTip = false
Vue.prototype.GLOBAL = config
Vue.prototype.axios = axios
Vue.use(ElementUI,{size:'small',zIndex:3000})
Vue.use(VueRouter)

const routes = [
{ 
	path: '/', 
	redirect: 
	{ 
		name: 'login' 
	}
},
{ 
	name:'login',
	path: '/login',
	component: Login 
},
{ 
	name:'file',
	path: '/file',
	component: Project,
	meta:{
		requireAuth:true
	}
},
{
	name:'book',
	path:'/book',
	component:Book,
	meta:{
		requireAuth:true
	},
	redirect: 
	{ 
		name: 'bookshelf' 
	},
	children:[
	{
		name:'bookshelf',
		path:'bookshelf',
		component:Bookshelf,
		meta:{
			requireAuth:true
		}
	},
	{
		name:'return',
		path:'return',
		component:Return,
		meta:{
			requireAuth:true
		}
	},
	{
		name:'storage',
		path:'storage',
		component:Storage,
		meta:{
			requireAuth:true
		}
	}]
},
{ 
	name:'people',
	path: '/people',
	component: People,
	meta:{
		requireAuth:true
	}
}
]

const router = new VueRouter({
  routes // (缩写) 相当于 routes: routes
})

router.beforeEach((to, from, next) => {
	if (to.matched.some((r) => r.meta.requireAuth)) {
		if(getCookie('userName') != ''){
			next();
		}else{
			next({
				name: 'login'
			});
		}
	} else {
		next();
	}
});

new Vue({
	router:router,
	render: h => h(App),
}).$mount('#app')
