/*******************
*函数名：setCookie
*功能：给cookie的变量赋值
*输入参数：c_name,value
*c_name：要赋值的cookie变量名
*value：值
*输出参数：无
*******************/
export default function setCookie(c_name,value)
{
    document.cookie = c_name + "=" + escape(value) + ";";
}