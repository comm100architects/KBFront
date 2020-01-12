import React from "react";
import { CPage } from "../../../components/Page";
import { CIconButton, CButton } from "../../../components/Buttons";
import { CIcon } from "../../../components/Icons";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import moment from "moment";
import { CSearchBox } from "../../../components/SearchBox";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem, { TreeItemProps } from "@material-ui/lab/TreeItem";
import Typography from "@material-ui/core/Typography";
import FolderIcon from "@material-ui/icons/Folder";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import { SvgIconProps } from "@material-ui/core/SvgIcon";
import Divider from "@material-ui/core/Divider";
import { CTable } from "../../../components/Table";
import { Article, ArticleStatus } from "./Entity/Article";
import { DomainContext } from "./context";
import { ArticleFilter } from "./Domain/ArticleDomain";
import {
  makeCategoryTree,
  findRootCategory,
  CategoryTree,
} from "./Domain/CategoryDomain";
import {
  toPath,
  goToSearch,
  withQueryParam,
} from "../../../framework/locationHelper";
import { useHistory } from "react-router";
import * as Query from "query-string";
import {
  ITableSource,
  emptyTableSource,
} from "../../../components/Table/CTableSource";
import { CTableColumnContentProps } from "../../../components/Table";
import FormControl from "@material-ui/core/FormControl";
import { StatusSelect } from "./StatusSelect";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "row",
      position: "relative",
    },
    kbs: {
      position: "absolute",
      right: 10,
      top: -50,
      label: {
        marginRight: theme.spacing(1),
      },
    },
    categoryTree: {
      width: 204,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
    },
    divider: {
      marginRight: theme.spacing(3),
      marginLeft: theme.spacing(1),
      alignSelf: "stretch",
      height: "auto",
    },
    articles: {
      flexGrow: 1,
    },
    articlesToolbar: {
      display: "flex",
      alignItems: "flex-end",
      "& > *:first-child": {
        flexGrow: 1,
      },
      "& > *:not(:first-child)": {
        marginRight: theme.spacing(2),
      },
      "& > .MuiInput-root": {
        width: 120,
      },
    },
    statusSelect: {
      width: 150,
      minWidth: 150,
    },
  }),
);

const getCategory = (
  id: string,
  root: CategoryTree,
): CategoryTree | undefined => {
  if (root.id === id) {
    return root;
  }
  return root.children.find(category => getCategory(id, category));
};

const ArticlesTable = ({
  source,
  category,
  onDelete,
}: {
  source: ITableSource<Article>;
  category?: CategoryTree;
  onDelete?: (id: string) => void;
}) => {
  return (
    <CTable<Article>
      columns={[
        {
          id: "featured",
          content: ({ row }: CTableColumnContentProps<Article>) => (
            <CIcon name={row.featured ? "starPrimary" : "starAction"} />
          ),
        },
        {
          id: "status",
          content: ({ row }: CTableColumnContentProps<Article>) => {
            if (row.status === ArticleStatus.draft) {
              return <CIcon name="dotSecondary" />;
            }
            return <CIcon name="dotPrimary" />;
          },
        },
        { id: "title", header: "Title", sortable: true },
        {
          id: "category",
          header: "Category",
          sortable: true,
          content: ({ row }: CTableColumnContentProps<Article>) => (
            <>{category && getCategory(row.categoryId, category!)?.title}</>
          ),
        },
        {
          id: "tags",
          header: "Tag",
          sortable: true,
          content: ({ row }: CTableColumnContentProps<Article>) => (
            <>{row.tags.toString()}</>
          ),
        },
        {
          id: "helpful",
          header: <CIcon name="thumbUp" />,
          sortable: true,
        },
        {
          id: "notHelpful",
          header: <CIcon name="thumbDown" />,
          sortable: true,
        },
        {
          id: "modifiedTime",
          header: "Modified Time",
          sortable: true,
          content: ({ row }) => (
            <>{moment(row.modifiedTime as Date).format("lll")}</>
          ),
        },
        {
          id: "actions",
          header: "Actions",
          sortable: false,
          content: ({ row }: CTableColumnContentProps<Article>) => {
            return (
              <>
                <CIconButton
                  title="Edit"
                  icon="edit"
                  to={toPath("edit", withQueryParam("id", row.id))}
                />
                <CIconButton title="View" icon="view" to={row.url} external />
                <CIconButton
                  title="Delete"
                  icon="delete"
                  onClick={() => {
                    onDelete && onDelete!(row.id);
                  }}
                />
              </>
            );
          },
        },
      ]}
      defaultSort={{ key: "title", asc: true }}
      dataSource={source}
    />
  );
};

export default (): JSX.Element => {
  const history = useHistory();
  const query = Query.parse(history.location.search);
  const keyword = query.keyword as string | undefined;
  const kbId = query.kbId as string | undefined;
  const [filter, setFilter] = React.useState({
    keyword,
    kbId,
  } as ArticleFilter);
  React.useEffect(() => setFilter({ ...filter, keyword, kbId }), [
    keyword,
    kbId,
  ]);

  const { articleDomain, categoryDomain } = React.useContext(DomainContext)!;
  const [articles, setArticles] = React.useState(
    () => emptyTableSource as ITableSource<Article>,
  );
  React.useEffect(() => {
    setArticles(articleDomain.tableSource(filter));
  }, [filter]);

  const [categoryTree, setCategoryTree] = React.useState(
    undefined as CategoryTree | undefined,
  );
  React.useEffect(() => {
    categoryDomain.getCategories(filter.kbId).then(categories => {
      const tree = makeCategoryTree(categories, findRootCategory(categories));
      setCategoryTree(tree);
    });
  }, [filter.kbId]);

  const handleSearchKeyword = ({ target }: { target: { value: string } }) => {
    const keyword = target.value || undefined;
    goToSearch(history, withQueryParam("keyword", keyword));
    setFilter({ ...filter, keyword });
  };

  const handleDelete = async (articleId: string) => {
    if (window.confirm("Are you sure you want to delete the article?")) {
      await articleDomain.deleteArticle(articleId);
      setFilter({ ...filter }); // force refresh current component
    }
  };

  const classes = useStyles();
  return (
    <CPage title="Articles">
      <div className={classes.root}>
        <div className={classes.categoryTree}>
          <MenuItem>All Articles</MenuItem>
          {categoryTree && <CategoriesTree root={categoryTree!} />}
        </div>
        <Divider orientation="vertical" className={classes.divider} />
        <div className={classes.articles}>
          <div className={classes.articlesToolbar}>
            <div>
              <CButton primary to={toPath("new")} text="New Article" />
            </div>
            <FormControl className={classes.statusSelect}>
              <StatusSelect
                value={filter.status}
                onChange={(
                  event: React.ChangeEvent<{ value: ArticleStatus }>,
                ) => setFilter({ ...filter, status: event.target.value })}
              />
            </FormControl>
            <CSearchBox
              onChange={handleSearchKeyword}
              value={filter.keyword || ""}
            />
          </div>
          <ArticlesTable
            source={articles}
            category={categoryTree}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </CPage>
  );
};

// Category Tree

type StyledTreeItemProps = TreeItemProps & {
  bgColor?: string;
  color?: string;
  labelIcon: React.ElementType<SvgIconProps>;
  labelText: string;
  tools?: React.ReactNode;
};

const useTreeItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      color: theme.palette.text.secondary,
    },
    content: {
      color: theme.palette.text.secondary,
      borderTopRightRadius: theme.spacing(2),
      borderBottomRightRadius: theme.spacing(2),
      paddingRight: theme.spacing(1),
      fontWeight: theme.typography.fontWeightMedium,
      "$expanded > &": {
        fontWeight: theme.typography.fontWeightRegular,
      },
    },
    group: {
      marginLeft: 0,
      "& $content": {
        paddingLeft: theme.spacing(2),
      },
    },
    expanded: {},
    label: {
      fontWeight: "inherit",
      color: "inherit",
    },
    labelRoot: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(0.5, 0),
      "&:hover > $tools": {
        display: "block",
        whiteSpace: "nowrap",
      },
      height: 34,
    },
    labelIcon: {
      marginRight: theme.spacing(1),
    },
    labelText: {
      fontWeight: "inherit",
      flexGrow: 1,
    },
    tools: {
      display: "none",
    },
  }),
);

function StyledTreeItem(props: StyledTreeItemProps) {
  const classes = useTreeItemStyles();
  const { labelText, labelIcon: LabelIcon, color, bgColor, ...other } = props;

  return (
    <TreeItem
      label={
        <div className={classes.labelRoot}>
          <LabelIcon color="inherit" className={classes.labelIcon} />
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
          <div className={classes.tools}>{props.tools}</div>
        </div>
      }
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        group: classes.group,
        label: classes.label,
      }}
      {...other}
    />
  );
}

const useTreeStyles = makeStyles(
  createStyles({
    root: {
      height: 264,
      flexGrow: 1,
      maxWidth: 400,
    },
    header: {
      textTransform: "uppercase",
      userSelect: "none",
      paddingLeft: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
  }),
);

const renderTreeItems = (
  expandedNodes: string[],
  { id, title, children }: CategoryTree,
): JSX.Element => {
  return (
    <StyledTreeItem
      key={id}
      nodeId={id}
      labelText={title}
      labelIcon={expandedNodes.indexOf(id) === -1 ? FolderIcon : FolderOpenIcon}
      tools={
        <>
          <CIconButton title="Add" icon="add" />
          <CIconButton title="Edit" icon="edit" />
          <CIconButton title="Delete" icon="delete" />
        </>
      }
    >
      {children.map(c => renderTreeItems(expandedNodes, c))}
    </StyledTreeItem>
  );
};

const CategoriesTree = ({ root }: { root: CategoryTree }): JSX.Element => {
  const classes = useTreeStyles();
  const [expandedNodes, setExpandedNodes] = React.useState([
    root.id,
  ] as string[]);
  const handleNodeToggle = (_: React.ChangeEvent<{}>, ids: string[]) =>
    setExpandedNodes(ids);

  return (
    <>
      <MenuItem disabled className={classes.header}>
        category
      </MenuItem>
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
        onNodeToggle={handleNodeToggle}
        expanded={expandedNodes}
      >
        {renderTreeItems(expandedNodes, root)}
      </TreeView>
    </>
  );
};
