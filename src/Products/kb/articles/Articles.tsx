import * as React from "react";
import Page from "../../../components/Page";
import { CLinkButton } from "../../../components/Buttons";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import EditIcon from "@material-ui/icons/Edit";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import DeleteIcon from "@material-ui/icons/Delete";
import ViewIcon from "@material-ui/icons/Pageview";
import { Article, CategoryTree } from "./Model";
import StarIcon from "@material-ui/icons/Star";
import DotIcon from "@material-ui/icons/FiberManualRecord";
import MenuItem from "@material-ui/core/MenuItem";
import * as moment from "moment";
import SearchBox from "../../../components/SearchBox";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem, { TreeItemProps } from "@material-ui/lab/TreeItem";
import Typography from "@material-ui/core/Typography";
import FolderIcon from "@material-ui/icons/Folder";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import { SvgIconProps } from "@material-ui/core/SvgIcon";
import Divider from "@material-ui/core/Divider";
import AddIcon from "@material-ui/icons/Add";
import { CSelect } from "../../../components/Select";
import { CTable } from "../../../components/Table";
import { LocalTableSource } from "../../../components/Table/CTableSource";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "row",
    },
    categoryTree: {
      width: 200,
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
  }),
);

const distinct = (strs: string[]) =>
  Object.keys(strs.reduce((a, b) => ({ ...a, [b]: b }), {}));

const getTags = (articles: Article[]): string[] => {
  return distinct(
    articles.map(article => article.tags).reduce((a, b) => a.concat(b), []),
  );
};

const ArticleStatusPublishIcon = (props: SvgIconProps) => (
  <DotIcon {...props} color="primary" titleAccess="Draft" />
);

const ArticleStatusDraftIcon = (props: SvgIconProps) => (
  <DotIcon {...props} color="secondary" titleAccess="Draft" />
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
  rows,
  category,
}: {
  rows: Article[];
  category: CategoryTree;
}) => {
  return (
    <CTable<Article>
      columns={[
        {
          id: "featured",
          content: (row: Article) => {
            return (
              <StarIcon
                color={row.featured ? "primary" : "action"}
                fontSize="small"
                titleAccess="Featured"
              />
            );
          },
        },
        {
          id: "status",
          content: (row: Article) => {
            if (row.status === "draft") {
              return <ArticleStatusDraftIcon color="secondary" />;
            }
            return <ArticleStatusPublishIcon color="primary" />;
          },
        },
        { id: "title", header: "Title", sortable: true },
        {
          id: "category",
          header: "Category",
          sortable: true,
          content: (row: Article) => getCategory(row.category, category)?.label,
        },
        {
          id: "tags",
          header: "Tag",
          sortable: true,
          content: (row: Article) => row.tags.toString(),
        },
        {
          id: "helpful",
          header: <ThumbUpIcon fontSize="small" />,
          sortable: true,
        },
        {
          id: "notHelpful",
          header: <ThumbDownIcon fontSize="small" />,
          sortable: true,
        },
        {
          id: "modifiedTime",
          header: "Modified Time",
          sortable: true,
          content: (row: Article) =>
            moment(row.modifiedTime as Date).format("lll"),
        },
      ]}
      defaultSort={{ key: "title", asc: true }}
      dataSource={new LocalTableSource(rows)}
      actions={[
        {
          icon: <EditIcon fontSize="small" />,
          link: row => `edit?id=${row.id}`,
        },
        { icon: <ViewIcon fontSize="small" />, link: row => row.url },
        { icon: <DeleteForeverIcon fontSize="small" /> },
      ]}
    />
  );
};

export default ({
  articles,
  category,
}: {
  articles: Article[];
  category: CategoryTree;
}): JSX.Element => {
  const classes = useStyles({});
  const tags = getTags(articles);
  return (
    <Page title="Articles">
      <div className={classes.root}>
        <div className={classes.categoryTree}>
          <MenuItem>All Articles</MenuItem>
          <CategoriesTree root={category} />
        </div>
        <Divider orientation="vertical" className={classes.divider} />
        <div className={classes.articles}>
          <div className={classes.articlesToolbar}>
            <div>
              <CLinkButton color="primary" path="new" text="New Article" />
            </div>
            <CSelect
              value="all"
              items={[{ value: "all", text: "All Tags" }].concat(
                tags.map(tag => ({ value: tag, text: tag })),
              )}
            />
            <CSelect
              value="all"
              items={[
                {
                  value: "all",
                  text: "All Status",
                },
                {
                  value: "published",
                  text: "Published",
                  icon: ArticleStatusPublishIcon,
                },
                {
                  value: "draft",
                  text: "Draft",
                  icon: ArticleStatusDraftIcon,
                },
              ]}
            ></CSelect>
            <SearchBox onSearch={(_: string) => {}} />
          </div>
          <ArticlesTable rows={articles} category={category} />
        </div>
      </div>
    </Page>
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
  selectedNode: string,
  setSelectedNode: (n: string) => void,
  { id, label, children }: CategoryTree,
): JSX.Element => {
  const handleClick = (_: React.MouseEvent<HTMLElement>) => {
    console.log("select " + id);
    setSelectedNode(id);
  };
  return (
    <StyledTreeItem
      key={id}
      nodeId={id}
      labelText={label}
      labelIcon={expandedNodes.indexOf(id) === -1 ? FolderIcon : FolderOpenIcon}
      onClick={handleClick}
      tools={
        <>
          <IconButton tabIndex={-1} size="small">
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton tabIndex={-1} size="small">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton tabIndex={-1} size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      }
    >
      {children.map(c =>
        renderTreeItems(expandedNodes, selectedNode, setSelectedNode, c),
      )}
    </StyledTreeItem>
  );
};

const CategoriesTree = ({ root }: { root: CategoryTree }): JSX.Element => {
  const classes = useTreeStyles({});
  const [expandedNodes, setExpandedNodes] = React.useState([] as string[]);
  const [selectedNode, setSelectedNode] = React.useState("");
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
      >
        {renderTreeItems(expandedNodes, selectedNode, setSelectedNode, root)}
      </TreeView>
    </>
  );
};
