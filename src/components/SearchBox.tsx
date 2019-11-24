import * as React from "react";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

interface SearchBoxProps extends React.Props<{}> {
  label?: string;
  onSearch(keywords: string): void;
}

export default ({ label = "Keyword", onSearch }: SearchBoxProps) => {
  const [keywords, setKeywords] = React.useState("");
  const handleSearch = (_: React.FormEvent) => onSearch(keywords);
  const handleInput = (event: React.ChangeEvent<{ value: string }>) =>
    setKeywords(event.target.value);

  return (
    <Paper elevation={0} component="form" onSubmit={handleSearch}>
      <TextField
        placeholder={label}
        InputProps={{
          "aria-label": label,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton type="submit" aria-label="search" size="small">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        onChange={handleInput}
      />
    </Paper>
  );
};
