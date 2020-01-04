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

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onChange({ target: { value: keyword } });
    }
  };

  const handleSearch = () => {
    onChange({ target: { value: keyword } });
    inputRef.current?.focus();
  };

  const handleInput = (event: React.ChangeEvent<{ value: string }>) =>
    setKeyword(event.target.value);

  const inputRef = React.useRef<HTMLInputElement>();

  const handleClear = () => {
    setKeyword("");
    onChange({ target: { value: "" } });
    inputRef.current?.focus();
  };

  return (
    <Paper elevation={0} component="div">
      <TextField
        inputRef={inputRef}
        value={keyword}
        placeholder={label}
        InputProps={{
          "aria-label": label,
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                onClick={handleSearch}
                aria-label="search"
                size="small"
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: keyword ? (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} aria-label="clear" size="small">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : (
            <InputAdornment position="end">
              <IconButton
                style={{ visibility: "hidden" }}
                aria-label="clear"
                size="small"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        onKeyPress={handleKeyPress}
        onChange={handleInput}
      />
    </Paper>
  );
};
