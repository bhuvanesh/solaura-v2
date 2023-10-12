import { Button, CircularProgress, Stack } from "@mui/material";

const LoadingButton = ({
  loadingLabel,
  type = "submit",
  color = "primary",
  variant = "contained",
  ...buttonProps
}) => (
  <Button
    type={type}
    color={color}
    variant={variant}
    {...buttonProps}
    aria-disabled={buttonProps.isLoading}
    onClick={(e) => {
      if (buttonProps.isLoading) return;
      if (buttonProps.onClick) buttonProps.onClick(e);
    }}
  >
    {buttonProps.isLoading ? (
      <Stack direction="row" gap={1} alignItems="center">
        <CircularProgress color="inherit" size={16} />
        {loadingLabel ?? buttonProps.children}
      </Stack>
    ) : (
      buttonProps.children
    )}
  </Button>
);

export default LoadingButton;