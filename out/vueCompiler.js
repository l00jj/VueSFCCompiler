



const createFiles = async (files, outPath) => {
    console.log(files)
    console.log(outPath)
    await Promise.all(files.map(({ name, data }) =>
      fs.writeFile(path.resolve(outPath, name), data, 'utf8')))
      .then(e => vscode.window.showInformationMessage(`成功编译模板`))
      .catch(e => vscode.window.showInformationMessage(`!失败!编译模板`))
  
  }
  
  const VueCompilerSFC = require('@vue/compiler-sfc');
  const hash_sum = require('hash-sum');
  const vueCompiler = async (source, inputFilePath) => {
  
    const fileName = path.parse(inputFilePath).name;
    const result = []
    /////////////////////////////////////////////////////////////////
    const id = hash_sum(inputFilePath + source);
    const dataVId = 'data-v-' + id;
    const parseResult = VueCompilerSFC.parse(source, { sourceMap: false });
    const descriptor = parseResult.descriptor;
    const hasScoped = descriptor.styles.some((s) => s.scoped);
    /////////////////////////////////////////////////////////////////
    // 处理 <script>
    const script = VueCompilerSFC.compileScript(descriptor, {
      id: id,
      templateOptions: {
        scoped: hasScoped,
        compilerOptions: {
          scopeId: hasScoped ? dataVId : undefined,
        }
      },
    });
  
    // 处理 <template>
    const template = VueCompilerSFC.compileTemplate({
      id: id,
      source: descriptor.template.content,
      scoped: hasScoped,
      compilerOptions: {
        bindingMetadata: script ? script.bindings : undefined,
        scopeId: hasScoped ? dataVId : undefined,
      }
    });
  
  
    const renderName = '_sfc_render';
    const mainName = '_sfc_main';
  
    //console.log(script.content)
    //console.log(template.code)
  
    // 处理 template 标签
    const templateCode = template.code.replace(
      /\nexport (function|const) (render|ssrRender)/,
      '\n$1 _sfc_$2'
    );
  
    // 处理 script 标签
    const scriptCode = VueCompilerSFC.rewriteDefault(script.content, mainName);
  
    // 导出组件对象
    const jsOutput = [
      scriptCode,
      templateCode,
      mainName + '.render=' + renderName,
      'export default ' + mainName,
    ];
  
    if (hasScoped) {
      jsOutput.push(mainName + '.__scopeId = ' + JSON.stringify(dataVId));
    }
    const jsCode = jsOutput.join('\n');
    /////////////////////////////////////////////////////////////////
  
    // 处理 style 标签
  
    /*  var styleCodes = [];
   
     if (styles.length) {
       for (var i = 0; i < styles.length; i++) {
         var styleItem = styles[i];
         styleCodes.push(VueCompilerSFC.compileStyle({
           source: styleItem.content,
           id: dataVId,
           scoped: styleItem.scoped,
         }).code);
       }
     }
   
     var styleCode = styleCodes.join('\n');
     var styleUrl = url + '.css'; */
  
    const styles = descriptor.styles
    const styleCodes = styles.map(styleItem =>
      VueCompilerSFC.compileStyle({
        source: styleItem.content,
        id: dataVId,
        scoped: styleItem.scoped,
      }).code)
    const styleCode = styleCodes.join('\n');
  
    /////////////////////////////////////////////////////////////////
    result.push({ name: `${fileName}.esm.js`, data: jsCode, type: "js" })
    if (styleCodes.length)
      result.push({ name: `${fileName}.css`, data: styleCode, type: "css" })
  
    return result
    /* 暂无作用，容易发生错误
    styleCode = styleCode.replace(/url\(\s*(?:(["'])((?:\\.|[^\n\\"'])+)\1|((?:\\.|[^\s,"'()\\])+))\s*\)/g, function (match, quotes, relUrl1, relUrl2) {
      return 'url(' + quotes + resolveUrl(relUrl1 || relUrl2, styleUrl) + quotes + ')';
    }); */
    /*
    var styleSheet = new CSSStyleSheet();
   
    styleSheet.replaceSync(styleCode);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
   
   
   
    /* 
     
    
     */
  
    /* 
    
    chrome.__VueCompilerSFC = VueCompilerSFC
    chrome.__hash = hash
    
    
    const vueSFCLoad = async (url) => {
      const source = await fetch(url).then(r => r.text())
      //
      
      
      console.log(code);
    
      const scriptEl = document.createElement('script')
      scriptEl.innerHTML = code
      scriptEl.type = "module"
      document.head.appendChild(scriptEl)
    
  }
   
   
  const search = Object.fromEntries(location.search.slice(1).split("&").map(i => i.split("=")));
  //'/main/loding-infinity-circle/loding-infinity-circle.vue'
  //search.vue && vueSFCLoad(search.vue[0] === '/' ? search.vue : `/${search.vue}`);
   
   */
  }
  
  
  
  class Provider {
    constructor() {
  
    }
    refresh() {
      // 更新视图
    }
    //最终的子项
    getTreeItem(element) {
      //console.log(element)
      return new vscode.TreeItem(element);
    }
  
    //列表
    getChildren() {
      const { workspace } = vscode;
      console.log(1231231231)
      console.log(this)
      const { order } = this;
      // 获取配置的基金代码
      /* const favorites: string[] = workspace
        .getConfiguration()
        .get('fund-watch.favorites', []); */
      const favorites = ["163407",
        "161017"]
      // 依据代码排序
      return favorites.sort((prev, next) => (prev >= next ? 1 : -1) * order);
    }
  
  }
  /* 
  {
    "contributes": {
      // 配置
      "configuration": {
        // 配置类型，对象
        "type": "object",
        // 配置名称
        "title": "fund",
        // 配置的各个属性
        "properties": {
          // 自选基金列表
          "fund.favorites": {
            // 属性类型
            "type": "array",
            // 默认值
            "default": [
              "163407",
              "161017"
            ],
            // 描述
            "description": "自选基金列表，值为基金代码"
          },
          // 刷新时间的间隔
          "fund.interval": {
            "type": "number",
            "default": 2,
            "description": "刷新时间，单位为秒，默认 2 秒"
          }
        }
      }
    }
   */
  
  /**
   * 插件被释放时触发
   */
  exports.deactivate = function () {
    vscode.window.showInformationMessage('VueSFCCompiler 已退出');
  };
  
  
  