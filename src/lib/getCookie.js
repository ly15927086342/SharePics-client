/*******************
*函数名：getCookie
*功能：解析cookie的变量
*输入参数：c_name
*c_name：要获取的cookie变量名
*输出参数：cookie值
*******************/
export default function getCookie(c_name)
{
    if (document.cookie.length>0)
    {
        let c_start = document.cookie.indexOf(c_name + "=")
        if (c_start!=-1)
        { 
            c_start=c_start + c_name.length+1 
            let c_end=document.cookie.indexOf(";",c_start)
            if (c_end==-1) c_end=document.cookie.length
                return unescape(document.cookie.substring(c_start,c_end))
        } 
    }
    return null;
}
