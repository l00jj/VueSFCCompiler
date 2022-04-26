const vscode = require('vscode');
const path = require('path');
const fs = require('fs/promises');
const EventEmitter = require('events');



















class Configs {
  key_traget = 'configs'
  emitter = new EventEmitter()
  constructor(extensionContext) {
    this.context = extensionContext
  }
  clear = () => this.context.globalState.update(this.key_traget, undefined)
  get = async () => {
    return await this.context.globalState.get(this.key_traget, [])
  }
  update = async (value) => {
    return await this.context.globalState.update(this.key_traget, value)
  }
  add = async (config) => {
    const lastConfigs = await this.get()
    /*  //
     if (!path.isAbsolute(inputPath)) {
       vscode.window.showWarningMessage('VueSFCCompiler 添加配置无改变: 所选路径需要为绝对路径')
       return;
     }
     //
     if (lastConfigs.includes(inputPath)) {
       vscode.window.showWarningMessage('VueSFCCompiler 添加配置无改变: 所选路径已存在')
     } else {
       const newConfigs = [...new Set([inputPath, ...lastConfigs])]
       await this.context.globalState.update(this.key_traget, newConfigs)
       vscode.window.showInformationMessage('VueSFCCompiler 添加配置成功');
     } */
    lastConfigs.push(config)
    await this.update(lastConfigs)
    vscode.window.showInformationMessage('VueSFCCompiler 添加配置成功');
    this.emitter.emit('onChanged', this.add);
  }
}



















const tool = {
  async getWebViewContent(extensionPath, webviewPath) {
    const resourcePath = path.join(extensionPath, webviewPath);
    const dirPath = path.dirname(resourcePath);
    const replacePath = inputPath => vscode.Uri.file(path.resolve(dirPath, inputPath))
      .with({ scheme: 'vscode-resource' }).toString()
    let html = await fs.readFile(resourcePath, 'utf-8')
      .catch(e => null)
    html = html
      /* //暂不支持 importmap 动态表，页面已生成，无法后插入动态表
      .replace(/(<script.+?type="importmap".*>)([\s\S]+?)(<\/script>)/g, (m, $1, $2, $3) => {
        const deepReplace = (input) => {
          for (let arg in input) {
            if (typeof input[arg] === "object") deepReplace(input[arg])
            else if (typeof input[arg] === "string") input[arg] = replacePath(input[arg])
          }
        }
        try {
          const obj = JSON.parse($2)
          deepReplace(obj)
          return $1 + JSON.stringify(obj) + $3
        } catch (e) {
          return $1 + $2 + $3
        }
      }) */
      .replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => $1 + replacePath($2) + '"');
    return html;
  }



}



















class App {
  constructor(extensionContext) {
    this.context = extensionContext
    this.configs = new Configs(extensionContext)
    this.configs.emitter.on('onChanged', this.stateEstimate)
  }








  hasAddConfigView = false
  key_command_addConfig = "VueSFCCompiler.addConfig"
  command_addConfig = async () => {
    if (this.hasAddConfigView) return;
    this.hasAddConfigView = true
    // 切换到资源管理器
    vscode.commands.executeCommand('workbench.view.explorer')
    // 创建webview
    const panel = vscode.window.createWebviewPanel('testWebview', "添加配置",
      vscode.ViewColumn.One, { enableScripts: true, retainContextWhenHidden: true });
    const html = await tool.getWebViewContent(this.context.extensionPath, '/webview_addConfig/index.html')
    //console.log(html)
    panel.webview.html = html
    //接收信息
    const onDidReceiveMessage = panel.webview.onDidReceiveMessage(message => {
      //console.log('插件收到的消息：', message);
      panel.dispose()
      this.configs.add(message.config)
    });

    const onDidDispose = panel.onDidDispose(message => {
      //console.log("onDidDispose")
      this.hasAddConfigView = false
      onDidReceiveMessage.dispose()
      onDidDispose.dispose()
    })
  }









  key_command_clearConfigs = "VueSFCCompiler.clearConfigs"
  command_clearConfigs = () => {
    this.configs.clear()
  }









  onWorkspaceFoldersChanged = (changed) => {
    console.log("onWorkspaceFoldersChanged",changed)
    this.stateEstimate(onWorkspaceFoldersChanged)
  }









  onDidChangeStorage = (changed) => {
    console.log(changed)
    vscode.window.showInformationMessage(`onDidChangeStorage ${JSON.stringify(changed.value)}`);
  }









  onWillSaveTextDocument = ({ document }) => {
    const { uri, isDirty, languageId } = document
    if (!languageId === "vue" || !isDirty) return;//判断是否为vue文件
    else this.compileVue(uri.fsPath)
  }









  compileVue = async (inputVuePath) => {
    ///////////////////////////////防抖/////////////////////////////////
    //获取配置列表
    const configs = await this.configs.get()
    //寻找就近的一个配置文件
    const configFilePath = configs
      .sort((a, b) => a.length < b.length)
      .find(str => inputVuePath.startsWith(path.dirname(str)))
    ///////////////////////////////升级以下环节，做文件处理的备份，用hashID确认是否需要再次处理/////////////////////////////////
    //无文件则退出
    if (!configFilePath) return;
    const primaryConfigs = await fs.readFile(configFilePath)
      .then(r => JSON.parse(r))
      .then(r => Array.isArray(r) ? r : null)
      .catch(e => null)
    //无配置则退出
    if (!primaryConfigs) return;
    //
    const configFileDir = path.dirname(configFilePath)
    //逐个配置寻找配置的路径
    /*    const config = []
       primaryConfigs.forEach(item => {
         try {
           item.rootDir = configFileDir
   
         } catch {
   
         }
       });
       const rootDir =
       const outDir =
   
       //检测 rootDir 和 outDir 是否冲突
       if () */
    console.log(config)
    /* 
  
  
    console.log(vscode.workspace.workspaceFolders)
    const rootPath = vscode.workspace.rootPath //工作区目录
    const configFileName = 'vuecompiler-config.json'
    const configFilePath = path.resolve(rootPath, configFileName)
  
     */



    /*  const files = await vueCompiler(document.getText(), inputFilePath)
       .catch(e => (console.log(e), null))
 
 
     await createFiles(files, path.resolve(inputFilePath, '..'))
 
     const createFiles = async (files, outPath) => {
       console.log(files)
       console.log(outPath)
       await Promise.all(files.map(({ name, data }) =>
         fs.writeFile(path.resolve(outPath, name), data, 'utf8')))
         .then(e => vscode.window.showInformationMessage(`成功编译模板`))
         .catch(e => vscode.window.showInformationMessage(`!失败!编译模板`))
 
     } */
  }









  stateEstimate = async (from) => {
    let fromInfo;
    //
    switch (from) {
      case undefined:
        fromInfo = '插件启动触发检查状态'
        break;
      case this.configs.add:
        fromInfo = '发现新配置'
        break;
      case onConfigurationChanged:
        fromInfo = 'onConfigurationChanged 配置更改触发检查状态'
        break;
      case onWorkspaceFoldersChanged:
        fromInfo = 'onWorkspaceFoldersChanged 工作区更改触发检查状态'
        break;
    }
    //
    const workspaceFolders = vscode.workspace.workspaceFolders
    const needActivate = workspaceFolders ? await (async () => {
      const configs = (await this.configs.get()).map(str => path.dirname(str))
      return workspaceFolders.some((folder) => {
        const folderPath = folder.uri.fsPath
        return configs.some(configPath => folderPath.length > configPath.length ?
          folderPath.startsWith(configPath) : configPath.startsWith(folderPath)
        )
      })
    })() : false
    //
    if (needActivate) this.activate()
    else this.deactivate()
  }









  isActivate = false
  key_showConsole = "VueSFCCompiler.showConsole"
  funs_clearRegister = []
  activate = () => {
    if (this.isActivate) return;
    this.isActivate = true;
    //启动文件保存监听
    const onDidSaveTextDocument = vscode.workspace.onWillSaveTextDocument(this.onWillSaveTextDocument)
    this.funs_clearRegister.push(() => onDidSaveTextDocument.dispose())
    //
    vscode.commands.executeCommand('setContext', this.key_showConsole, this.isActivate)
    //
    vscode.window.showInformationMessage('VueSFCCompiler 工作区存在配置，已启动');
  }









  deactivate = () => {
    if (!this.isActivate) return;
    this.isActivate = false;
    //
    vscode.commands.executeCommand('setContext', this.key_showConsole, this.isActivate)
    //
    Promise.all(this.funs_clearRegister.map(fun => fun()))
    this.funs_clearRegister = []
    //
    vscode.window.showInformationMessage('VueSFCCompiler 已关闭');
  }
}



















/// 插件激活时
exports.activate = function (context) {
  const app = new App(context)

  //注册命令添加路径功能
  context.subscriptions.push(
    vscode.commands.registerCommand(app.key_command_addConfig, app.command_addConfig))
  //注册命令清空路径功能
  context.subscriptions.push(
    vscode.commands.registerCommand(app.key_command_clearConfigs, app.command_clearConfigs))
  // 监听是否有工作区变动 - 初始启动不会有触发
  const onDidChangeWorkspaceFolders =
    vscode.workspace.onDidChangeWorkspaceFolders(app.onWorkspaceFoldersChanged)
//
const onDidChangeActiveTextEditor =
    vscode.window.onDidChangeActiveTextEditor((textEditor)=>{
console.log("textEditor",textEditor)
    })

    const     onDidChangeVisibleTextEditors =
    vscode.window.onDidChangeVisibleTextEditors((textEditors)=>{
console.log("textEditors",textEditors)
    })



  // 是否存在存储监听，如有则监听
  const onDidChangeStorageFun = context?.globalState?._storage?.onDidChangeStorage
  const onDidChangeStorage =
    typeof onDidChangeStorageFun === 'function' && onDidChangeStorageFun(app.onDidChangeStorage)


  //初始检测
  //app.stateEstimate()


  context.subscriptions.push(vscode.commands.registerCommand('VueSFCCompiler.test', async () => {
    console.log(`当前状态 ${app.isActivate}`)
    //console.log(await app.configs.get())
    //provider.refresh()
    testPale.dispose()
  }))


  let isShowConfigsConsole = false
  vscode.commands.executeCommand('setContext', "VueSFCCompiler.isShowConfigsConsole", isShowConfigsConsole)


  context.subscriptions.push(vscode.commands.registerCommand('VueSFCCompiler.openConfigsConsole', async () => {
    vscode.commands.executeCommand('setContext', "VueSFCCompiler.isShowConfigsConsole", isShowConfigsConsole = !isShowConfigsConsole)
  }))




  /* 
   
   
   
    var thisProvider = {
      async resolveWebviewView(thisWebview, thisWebviewContext, thisToke) {
        console.log(thisWebview)
        console.log(thisWebview.webview.postMessage)
   
        const html = await getWebViewContent(context, '/webview_sidebar/index.html')
        console.log(html)
        thisWebview.webview.options = { enableScripts: true }
        thisWebview.webview.html = html;
      }
    };
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider("VueSFCCompiler.sidebarsss", thisProvider)
    );
   
   
   */





  class Provider {
    refreshEvent = new vscode.EventEmitter()
    constructor() {
      this.onDidChangeTreeData = this.refreshEvent.event;
    }
    data = []
    async refresh() {
      const configs = await app.configs.get()
      this.data = configs
      this.refreshEvent.fire(null);
    }
    //最终的子项
    getTreeItem(element) {
      //console.log(element)
      return element
    }

    //列表
    getChildren(element) {
      //console.log("element", element)
      let provider
      if (element) {
        const config = element.contextValue
        provider = ["rootDir", "outDir", "isMergeCss"].map(key => {
          const item = new vscode.TreeItem(config[key]);
          const value = config[key].toString()
          item.label = key
          item.description = value
          item.tooltip = value
          item.contextValue = value
          //item.resourceUri =new vscode.Uri('file','',config.rootDir)
          //item.command= { command: 'fileExplorer.openFile', title: "Open File", arguments: [vscode.Uri.file(value)], };
          return item
        })
      } else {
        provider = this.data.map(config => {
          const item = new vscode.TreeItem(config.rootDir, vscode.TreeItemCollapsibleState.Expanded);
          item.label = path.basename(config.rootDir)
          item.tooltip = config.rootDir
          item.contextValue = config
          item.description = config.rootDir
          return item
        })
      }
      return provider
    }

  }

  const provider = new Provider();
  provider.refresh()
  console.log(provider)
  // 数据注册
  vscode.window.registerTreeDataProvider("VueSFCCompiler.sidebar", provider);
  //注册侧边栏面板的实现
  //const sidebar_test = new sidebar.EntryList();
  //vscode.window.registerTreeDataProvider("sidebar_test_id1",sidebar_test);

  console.log("context", context)
  console.log("vscode", vscode)

  //注册命令 
  vscode.commands.registerCommand("fileExplorer.openFile", (...args) => {
    console.log(args)

  });


  class Providerxx {
    refreshEvent = new vscode.EventEmitter()
    constructor() {
      this.onDidChangeTreeData = this.refreshEvent.event;
    }
    data = []
    async refresh() {
      const configs = await app.configs.get()
      this.data = configs
      this.refreshEvent.fire(null);
    }
    //最终的子项
    getTreeItem(element) {
      //console.log(element)
      return element
    }

    //列表
    getChildren(element) {
      //console.log("element", element)
      let provider
      provider = ["321", "32131", "3213"].map(key => {
        const item = new vscode.TreeItem(key)
        item.label = key
        item.tooltip = key
        item.contextValue = key
        item.description = key
        item.iconPath = new vscode.ThemeIcon("diff-added")
        item.command = { command: 'fileExplorer.openFile', title: "Open File", arguments: [312312312] };
        return item
      })
      /* 
        provider = this.data.map(config => {
          const item = new vscode.TreeItem(config.rootDir, vscode.TreeItemCollapsibleState.Expanded);
          item.label = path.basename(config.rootDir)
          item.tooltip = config.rootDir
          item.contextValue = config
          item.description = config.rootDir
          return item 
        })
        */
      console.log(provider)
      return provider
    }

  }


   vscode.window.registerTreeDataProvider("VueSFCCompiler.testPale", new Providerxx());
   //const testPale = vscode.window.registerTreeDataProvider("VueSFCCompiler.configsConsole", new Providerxx());
   const  providerxx= new Providerxx()
   const testPale = vscode.window.createTreeView("VueSFCCompiler.configsConsole", {
    treeDataProvider: providerxx
  });

  console.log("providerxx",providerxx)
  console.log("testPale",testPale)

}



















/**
 * 插件被释放时触发
 */
exports.deactivate = function () {
  vscode.window.showInformationMessage('VueSFCCompiler 已退出');
};