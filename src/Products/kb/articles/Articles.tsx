import * as React from "react";
import Page from "../../../components/Page";
import { New, LinkIcon } from "../../../components/Buttons";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import Select from "@material-ui/core/Select";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import EditIcon from "@material-ui/icons/Edit";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import ViewIcon from "@material-ui/icons/Pageview";
import {
  createArticle,
  Article,
  ArticleStatus,
  testArticles,
  testTags,
} from "./State";
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
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import InfoIcon from "@material-ui/icons/Info";
import ForumIcon from "@material-ui/icons/Forum";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import { SvgIconProps } from "@material-ui/core/SvgIcon";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "row",
    },
    categoryTree: {
      width: 240,
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

export default (): JSX.Element => {
  const classes = useStyles({});
  return (
    <Page title="Articles">
      <div className={classes.root}>
        <div className={classes.categoryTree}>
          <MenuItem>All Articles</MenuItem>
          <CategoriesTree />
        </div>
        <Divider orientation="vertical" className={classes.divider} />
        <div className={classes.articles}>
          <div className={classes.articlesToolbar}>
            <div>
              <New to="new">New Article</New>
            </div>
            <Select multiple value={[]} title="Category">
              {testTags.map(tag => (
                <MenuItem value={tag}>{tag}</MenuItem>
              ))}
            </Select>
            <Select value="all" title="Status">
              <MenuItem value="all">All Status</MenuItem>;
              <MenuItem value="draft">Draft</MenuItem>;
              <MenuItem value="published">Published</MenuItem>;
            </Select>
            <SearchBox onSearch={(_: string) => {}} />
          </div>
          <ArticlesTable rows={testArticles} />
        </div>
      </div>
    </Page>
  );
};

// Article Table

function desc<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort<T>(array: T[], cmp: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

type Order = "asc" | "desc";

function getSorting<K extends keyof any>(
  order: Order,
  orderBy: K,
): (
  a: { [key in K]: number | string | string[] | Date | boolean },
  b: { [key in K]: number | string | string[] | Date | boolean },
) => number {
  return order === "desc"
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy);
}

interface HeadCell {
  id: keyof Article;
  label: string | JSX.Element;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  { id: "title", numeric: false, label: "Title" },
  { id: "category", numeric: false, label: "Category" },
  { id: "tags", numeric: false, label: "Tag" },
  { id: "helpful", numeric: true, label: <ThumbUpIcon fontSize="small" /> },
  {
    id: "notHelpful",
    numeric: true,
    label: <ThumbDownIcon fontSize="small" />,
  },
  { id: "modifiedTime", numeric: true, label: "Modified Time" },
];

interface EnhancedTableProps {
  classes: ReturnType<typeof useTableStyles>;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Article,
  ) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Article) => (
    event: React.MouseEvent<unknown>,
  ) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell key="featured" className={classes.iconCell}></TableCell>
        <TableCell key="status" className={classes.iconCell}></TableCell>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align="left"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={order}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell key="actions" align="center" size="small">
          Actions
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

const useTableStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      marginTop: theme.spacing(3),
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(2),
      border: `solid 1px ${theme.palette.divider}`,
    },
    table: {
      minWidth: 750,
    },
    tableWrapper: {
      overflowX: "auto",
    },
    visuallyHidden: {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: -1,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      top: 20,
      width: 1,
    },
    iconCell: {
      width: 25,
    },
    actions: { whiteSpace: "nowrap" },
  }),
);

const ArticlesTable = ({ rows }: { rows: Article[] }) => {
  const classes = useTableStyles();
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof Article>("title");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (
    _: React.MouseEvent<unknown>,
    property: keyof Article,
  ) => {
    const isDesc = orderBy === property && order === "desc";
    setOrder(isDesc ? "asc" : "desc");
    setOrderBy(property);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className={classes.root}>
      <Paper elevation={0} className={classes.paper}>
        <div className={classes.tableWrapper}>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(rows, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(row => {
                  return (
                    <TableRow hover tabIndex={-1} key={row.id}>
                      <TableCell align="left" size="small">
                        {row.featured ? (
                          <StarIcon
                            color="primary"
                            fontSize="small"
                            titleAccess="Featured"
                          />
                        ) : (
                          ""
                        )}
                      </TableCell>
                      <TableCell align="left" padding="none" size="small">
                        <DotIcon
                          fontSize="small"
                          color={
                            row.status === "draft" ? "secondary" : "primary"
                          }
                          titleAccess={
                            row.status === "draft" ? "Draft" : "Published"
                          }
                        />
                      </TableCell>
                      <TableCell align="left">{row.title}</TableCell>
                      <TableCell align="left">{row.category}</TableCell>
                      <TableCell align="left">{row.tags.join(", ")}</TableCell>
                      <TableCell align="left">{row.helpful}</TableCell>
                      <TableCell align="left">{row.notHelpful}</TableCell>
                      <TableCell align="left">
                        {moment(row.modifiedTime).format("lll")}
                      </TableCell>
                      <TableCell
                        align="center"
                        size="small"
                        className={classes.actions}
                      >
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <LinkIcon size="small" to={row.url} target="_blank">
                          <ViewIcon fontSize="small" />
                        </LinkIcon>
                        <IconButton size="small">
                          <DeleteForeverIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
};

// Category Tree

declare module "csstype" {
  interface Properties {
    "--tree-view-color"?: string;
    "--tree-view-bg-color"?: string;
  }
}

type StyledTreeItemProps = TreeItemProps & {
  bgColor?: string;
  color?: string;
  labelIcon: React.ElementType<SvgIconProps>;
  labelInfo?: string;
  labelText: string;
};

const useTreeItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      color: theme.palette.text.secondary,
      "&:focus > $content": {
        backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
        color: "var(--tree-view-color)",
      },
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
    },
    labelIcon: {
      marginRight: theme.spacing(1),
    },
    labelText: {
      fontWeight: "inherit",
      flexGrow: 1,
    },
  }),
);

function StyledTreeItem(props: StyledTreeItemProps) {
  const classes = useTreeItemStyles();
  const {
    labelText,
    labelIcon: LabelIcon,
    labelInfo,
    color,
    bgColor,
    ...other
  } = props;

  return (
    <TreeItem
      label={
        <div className={classes.labelRoot}>
          <LabelIcon color="inherit" className={classes.labelIcon} />
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </div>
      }
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor,
      }}
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

const CategoriesTree = (): JSX.Element => {
  const classes = useTreeStyles();

  return (
    <>
      <MenuItem disabled className={classes.header}>
        category
      </MenuItem>
      <TreeView
        className={classes.root}
        defaultExpanded={["3"]}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
      >
        <StyledTreeItem
          nodeId="1"
          labelText="Live Chat"
          labelIcon={FolderIcon}
          labelInfo="90"
        />
        <StyledTreeItem
          nodeId="2"
          labelText="Ticket"
          labelIcon={FolderIcon}
          labelInfo="80"
        />
        <StyledTreeItem
          nodeId="3"
          labelText="Others"
          labelIcon={FolderOpenIcon}
        >
          <StyledTreeItem
            nodeId="5"
            labelText="Social"
            labelIcon={FolderIcon}
            labelInfo="90"
            color="#1a73e8"
            bgColor="#e8f0fe"
          />
          <StyledTreeItem
            nodeId="6"
            labelText="Updates"
            labelIcon={FolderIcon}
            labelInfo="2,294"
            color="#e3742f"
            bgColor="#fcefe3"
          />
          <StyledTreeItem
            nodeId="7"
            labelText="Forums"
            labelIcon={FolderIcon}
            labelInfo="3,566"
            color="#a250f5"
            bgColor="#f3e8fd"
          />
          <StyledTreeItem
            nodeId="8"
            labelText="Promotions"
            labelIcon={FolderIcon}
            labelInfo="733"
            color="#3c8039"
            bgColor="#e6f4ea"
          />
        </StyledTreeItem>
      </TreeView>
    </>
  );
};
