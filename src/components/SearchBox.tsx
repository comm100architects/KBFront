import * as React from "react";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

export interface SearchBoxProps {
  label?: string;
  value: string;
  onChange(event: { target: { value: string } }): void;
}

export const CSearchBox = ({
  label = "Keyword",
  value = "",
  onChange,
}: SearchBoxProps) => {
  const [keyword, setKeyword] = React.useState(value);
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onChange({ target: { value: keyword } });
  };
  const handleInput = (event: React.ChangeEvent<{ value: string }>) =>
    setKeyword(event.target.value);

  const handleReset = () => {
    setKeyword("");
    onChange({ target: { value: "" } });
  };

  React.useEffect(() => setKeyword(value), [value]);

  return (
    <Paper
      elevation={0}
      component="form"
      onSubmit={handleSearch}
      onReset={handleReset}
    >
      <TextField
        value={keyword}
        placeholder={label}
        InputProps={{
          "aria-label": label,
          startAdornment: (
            <InputAdornment position="start">
              <IconButton type="submit" aria-label="search" size="small">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: keyword ? (
            <InputAdornment position="end">
              <IconButton type="reset" aria-label="clear" size="small">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : (
            <></>
          ),
        }}
        onChange={handleInput}
      />
    </Paper>
  );
};
