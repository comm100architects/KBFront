## 运行
获取代码后执行
1. `npm install`
2. `npm run gen`
3. `npx gulp`

npx gulp会启动多个服务
* localhost:9000，本地服务器，包括json-server和static files。单独运行的命令是npm run server
* webpack编译，源代码改动后会自动编译。单独编译的命令是npm run js
* dev/gen*.js改动后自动更新json-server的数据源。单独生成数据的命令是npm run gen

## 设计

整个界面是一个树型结构，控件套控件
```xml
<CPage>
  <Form>
    <Row>
      <CInputControl />
    </Row>
    <Row>
      <CInputControl />
    </Row>
  </Form>
</CPage>
```

```xml
<CPage>
  <TableToolbar>
    <NewButton />
    <Filters>
      <CInputControl />
      <CInputControl />
    </Filters>
  </TableToolbar>
  <Table>
  </Table>
</CPage>
```

CPage外层还有菜单等：
```xml
<Root>
  <NavigationBar />
  <Menu />
  <CPage>…</CPage>
</Root>
```

每一个控件都是一个函数
* 参数是UIPage
* 返回值是Promise<ReactComponent>，这个Promise是包含所有子控件的
* ReactComponent也是一个函数，参数是React props，返回值是React VDom Element
* 执行过程
  1. 获取UIPage
  2. 处理从服务器获取的UIPage，转成方便后续使用的对象，例如：初始化repository
  3. 调用控件函数，显示loading，等待promise resolve，得到ReactComponent
    * 获取代码，部分控件代码需要按需加载，例如CodeEditor
    * 从服务器获取数据，凡是页面载入时获取一次之后就不用再拿的数据都在这步做
    * 载入之后会根据界面操作更新或者再获取的数据放在ReactComponent的model层里
  4. 调用render把ReactComponent渲染出来

Example
```tsx
const makeForm = async (page: UIPage): Promise<React.ComponentType<any>> => {
const rows = await Promise.all(
  page.rows.map((row, i) => makeRow(row, i)),
);

return (props) => {
    return <Formik> {rows.map(Row => <Row />)} </Formik>;
  };
}

const makeRow = async (page: UIPage, i: number): Promise<React.ComponentType<any>> => {
  const fieldName = page.rows[i].fieldName;
  const options = await page.entity.fields[fieldName].repository.getList();
  return () => {
    return <CSelect options={options} />;
  };
}
```
        

每个一个ReactComponent里包含MVC。
* Model（state）
  * 需要知道props，初始化model
  * 保存界面控件状态，例如：Table的Filter部分的控件的状态
  * 保存服务器获取到的Entity数据
  * 很多控件是不需要Model层的
    * 表单的状态是由Formilk维护的，我们的代码不需要有状态。
    * 到目前为止封装的控件除了KeywordSearch外都是没有状态的
  * 使用hooks实现，状态变更后React会自动重画view
* View
  * 需要知道props，controller和model
  * 从props和model生成VDom 
* Controller
  * 事件响应函数。需要知道props和model
  * 调用上层事件，参数上可能会做一些逻辑
  * 调用Repository接口和服务器交互，之后根据返回修改model；或者直接修改model
  * 跳转到其他页面，例如：表单提交成功后跳转到表格界面

## 代码结构

### src/index.tsx
* 程序入口，`React.render`在这里

### src/components
* 基于material-ui的公共控件，未来会移到单独的项目里变成node_modules里的一个依赖

### src/gen
* Auto coding的代码，根据服务器返回的配置生成React components

### src/framework
* 一些帮助函数，未来应该会移到单独的项目里变成node_modules里的一个依赖

### src/Products/
里面分三层目录
1. 根据产品分成多个目录，livechat/ticket/kb等。未来需要考虑不同的产品代码分开
2. 每个产品目录里根据每个菜单一个目录
    * 菜单是懒加载的，点击菜单之后会先下载代码
3. 菜单里面的页面
    * 使用auto coding生成代码的页面在这里没有对应的页面
