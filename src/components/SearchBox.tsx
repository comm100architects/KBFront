import * as React from "react";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

interface SearchBoxProps {
  label?: string;
  value: string;
  onSearch(keyword: string): void;
}

export default ({
  label = "Keyword",
  value = "",
  onSearch,
}: SearchBoxProps) => {
  const [keyword, setKeyword] = React.useState(value);
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(keyword);
  };
  const handleInput = (event: React.ChangeEvent<{ value: string }>) =>
    setKeyword(event.target.value);

  React.useEffect(() => setKeyword(value), [value]);

  return (
    <Paper elevation={0} component="form" onSubmit={handleSearch}>
      <TextField
        value={keyword}
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
