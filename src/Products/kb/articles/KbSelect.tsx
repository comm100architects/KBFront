import * as React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { RESTfulRepository } from "../../../framework/repository";
import { CSelect } from "../../../components/Select";
import { useHistory, useLocation } from "react-router";
import * as Query from "query-string";
import { Kb } from "./Entity/Kb";
import { goToSearch, withQueryParam } from "../../../framework/locationHelper";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    kbs: {
      position: "absolute",
      right: 56,
      top: 35,
      "& > label": {
        marginRight: theme.spacing(1),
      },
    },
  }),
);
interface SelectKbProps {
  onSelect(selectedKb: string): void;
}
export const KbSelect = ({ onSelect }: SelectKbProps) => {
  const classes = useStyles({});
  const history = useHistory();
  const location = useLocation();
  const kbId = Query.parse(location.search).kbId as string;

  const [kbRepo] = React.useState(
    () => new RESTfulRepository<Kb>("//localhost:3000/kb"),
  );

  const [kbs, setKbs] = React.useState([] as Kb[]);

  React.useEffect(() => {
    kbRepo.list().then(kbs => {
      setKbs(kbs);
      if (!kbs.find(kb => kb.id === kbId)) {
        onSelect(kbs[0].id);
        goToSearch(history, withQueryParam("kbId", kbs[0].id));
      }
      onSelect(kbId);
    });
  }, []);

  const handleKbChange = (id: string) => {
    onSelect(id);
    goToSearch(history, withQueryParam("kbId", id));
  };

  return (
    <>
      {kbId && (
        <div className={classes.kbs}>
          <label>Knowlegbase:</label>
          <CSelect
            value={kbId}
            items={kbs.map(({ id, title }) => ({ value: id, text: title }))}
            onChange={handleKbChange}
          />
        </div>
      )}
    </>
  );
};
