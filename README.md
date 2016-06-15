从semantic-ui中抽取常用的控件作为项目最小的控件库
中抽取常用的控件作为项目最小的控件库
项目CSS架构
1.SASS预编译的，编译选项--style compressed;
2.CSS控件化 将HTML的页面内容分割成不可替换的最小单位 如 btn.css article.css icon.css select.css 每个都用sass编写使得属性值可以批量修改；
3.在项目使用public.css里边用@import引入需要的控件化模块,上线的环境不需要控件类的css,与上线环境解耦；
4.控件上使用控件命名，私有化的CSS样式使用统一的父类  防止私有样式和控件的样式互相污染；
5.控件化到组件化再到页面， 从设计稿提取控件化元素，使用控件拼成小组件，再成大组件，最后拼合成页面，使用jade的include和extend方法拼合页面，保证jade模块文件代码量少；
6.用缓存与CSS文件数，每个页面会引用public.css 和自己页面私有的module.css
