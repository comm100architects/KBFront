## 项目

### 执行

1. `npm install`
2. `npm run server`

### 工具

1. [Parcel](https://parceljs.org)
2. [Prettier](https://prettier.io/)
3. [Json Server](https://github.com/typicode/json-server)

### 发布

TODO

## 代码结构

### src/index.tsx

- 程序入口，`React.render`在这里

### src/components

- 基于 material-ui 的公共控件，未来会移到单独的项目里变成 node_modules 里的一个依赖

### src/gen

- Auto coding 的代码，根据服务器返回的配置生成 React components

### src/framework

- 一些帮助函数，未来应该会移到单独的项目里变成 node_modules 里的一个依赖

### src/Products/

里面分三层目录

1. 根据产品分成多个目录，livechat/ticket/kb 等。未来需要考虑不同的产品代码分开
2. 每个产品目录里根据每个菜单一个目录
   - 菜单是懒加载的，点击菜单之后会先下载代码
3. 菜单里面的页面
   - 使用 auto coding 生成代码的页面在这里没有对应的页面

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

CPage 外层还有菜单等：

```xml
<Root>
  <NavigationBar />
  <Menu />
  <CPage>…</CPage>
</Root>
```

每一个控件都是一个函数

- 参数是 UIPage
- 返回值是 Promise<ReactComponent>，这个 Promise 是包含所有子控件的
- ReactComponent 也是一个函数，参数是 React props，返回值是 React VDom Element
- 执行过程
  1. 获取 UIPage
  2. 处理从服务器获取的 UIPage，转成方便后续使用的对象，例如：初始化 repository
  3. 调用控件函数，显示 loading，等待 promise resolve，得到 ReactComponent
  - 获取代码，部分控件代码需要按需加载，例如 CodeEditor
  - 从服务器获取数据，凡是页面载入时获取一次之后就不用再拿的数据都在这步做
  - 载入之后会根据界面操作更新或者再获取的数据放在 ReactComponent 的 model 层里
  4. 调用 render 把 ReactComponent 渲染出来

Example

```tsx
const makeForm = async (page: UIPage): Promise<React.ComponentType<any>> => {
  const rows = await Promise.all(page.rows.map((row, i) => makeRow(row, i)));

  return props => {
    return (
      <Formik>
        {" "}
        {rows.map(Row => (
          <Row />
        ))}{" "}
      </Formik>
    );
  };
};

const makeRow = async (
  page: UIPage,
  i: number,
): Promise<React.ComponentType<any>> => {
  const fieldName = page.rows[i].fieldName;
  const options = await page.entity.fields[fieldName].repository.getList();
  return () => {
    return <CSelect options={options} />;
  };
};
```

每个一个 ReactComponent 里包含 MVC。

- Model（state）
  - 需要知道 props，初始化 model
  - 保存界面控件状态，例如：Table 的 Filter 部分的控件的状态
  - 保存服务器获取到的 Entity 数据
  - 很多控件是不需要 Model 层的
    - 表单的状态是由 Formilk 维护的，我们的代码不需要有状态。
    - 到目前为止封装的控件除了 KeywordSearch 外都是没有状态的
  - 使用 hooks 实现，状态变更后 React 会自动重画 view
- View
  - 需要知道 props，controller 和 model
  - 从 props 和 model 生成 VDom
- Controller
  - 事件响应函数。需要知道 props 和 model
  - 调用上层事件，参数上可能会做一些逻辑
  - 调用 Repository 接口和服务器交互，之后根据返回修改 model；或者直接修改 model
  - 跳转到其他页面，例如：表单提交成功后跳转到表格界面
