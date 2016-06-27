<p>从semantic-ui中抽取常用的控件作为项目最小的控件库 中抽取常用的控件作为项目最小的控件库
  </p>
  <h3>项目CSS架构</h3> 1.SASS预编译的，编译选项--style compressed;
  <br> 2.CSS控件化 将HTML的页面内容分割成不可替换的最小单位 如 btn.css article.css icon.css select.css 每个都用sass编写使得属性值可以批量修改；
  <br> 3.在项目使用public.css里边用@import引入需要的控件化模块,上线的环境不需要控件类的css,与上线环境解耦；
  <br> 4.控件上使用控件命名，私有化的CSS样式使用统一的父类 防止私有样式和控件的样式互相污染；
  <br> 5.控件化到组件化再到页面， 从设计稿提取控件化元素，使用控件拼成小组件，再成大组件，最后拼合成页面，使用jade的include和extend方法拼合页面，保证jade模块文件代码量少；
  <br> 6.用缓存与CSS文件数，每个页面会引用public.css 和自己页面私有的page层的模块.
  <br>
	<p>下列拆分成小控件的SCSS文件，只需将控件的样式文件用@import的方法引入public中即可，最后global.scss会定义控件的颜色全局变量可以按需要修改；normalize.css为reset样式表。</p>

  <h3>gomeplus包含的文件</h3> reset样式 normalize
  <h4>作为控件的元素：</h4>
  <ul>
    <li>button</li>
    <li>divider</li>
    <li>header</li>
    <li>input </li>
    <li>label</li>
    <li>segment</li>
  </ul>
  <h4>视图中处理的</h4>
  <ul>
    <li>card</li>
  </ul>
  <h4>作为控件的组合：</h4>
  <ul>
    <li>breadcrumb</li>
    <li>form</li>
    <li>menu</li>
    <li>message</li>
    <li>table</li>
  </ul>
  <h4>模块中的控件</h4>
  <ul>
    <li>accordion</li>
    <li>checkbox</li>
    <li>dimmer</li>
    <li>dropdown </li>
    <li>modal</li>
    <li>popup</li>
    <li>progress</li>
    <li>rating</li>
    <li>search</li>
    <li>tab</li>
    <li>transition</li>
  </ul>
  <h4>semantic-ui中下列的没有添加</h4>
  <h4>元素</h4> 容器 ontainer、 国旗 flag、 加载器 loader、 列表 list、 图片 image、 遮罩 reveal、 步骤 step；
  <h4>组合</h4> 网格 grid；
  <h4>模块中没添加的：</h4> nag 本质是个message、 sidebar、 Sticky、 embed 嵌入youtube的视频、 shape 形状；