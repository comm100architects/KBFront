import * as React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { RESTfulRepository } from "../../../framework/repository";
import { CSelect } from "../../../components/Select";
import { useHistory, useLocation } from "react-router";
import * as Query from "query-string";
import { Kb } from "./Entity/Kb";
import { goToSearch, withQueryParam } from "../../../framework/locationHelper";
import FormControl from "@material-ui/core/FormControl";

const useStyles = makeStyles((_: Theme) =>
  createStyles({
    kbs: {
      position: "absolute",
      right: 56,
      top: 35,
    },
  }),
);

export const KbSelect = () => {
  const classes = useStyles({});
  const history = useHistory();
  const location = useLocation();
  const kbId = Query.parse(location.search).kbId as string;

  const [kbRepo] = React.useState(
    () => new RESTfulRepository<Kb>("//localhost:3000", "knowledgeBases"),
  );

  const [kbs, setKbs] = React.useState([] as Kb[]);

  React.useEffect(() => {
    kbRepo.getList().then(kbs => {
      setKbs(kbs);
      if (!kbs.find(kb => kb.id === kbId)) {
        goToSearch(history, withQueryParam("kbId", kbs[0].id));
      }
    });
  }, []);

  const handleKbChange = (event: React.ChangeEvent<{ value: string }>) => {
    goToSearch(history, withQueryParam("kbId", event.target.value));
  };

  return (
    <>
      {kbId && (
        <div className={classes.kbs}>
          <FormControl>
            <CSelect
              id="kbSelect"
              value={kbId}
              options={kbs.map(({ id, name }) => ({ value: id, label: name }))}
              onChange={handleKbChange}
            />
          </FormControl>
        </div>
      )}
    </>
  );
};
