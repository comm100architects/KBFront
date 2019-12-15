import * as React from "react";
import { CElementProps } from "./Base";
import Button from "@material-ui/core/Button";
import { FormikHelpers, Formik, Form, Field, FieldProps } from "formik";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      display: "flex",
      flexDirection: "column",
      "& > *": {
        marginTop: theme.spacing(2),
      },
      "& button": {
        marginRight: theme.spacing(1),
      },
    },
  }),
);

export interface CFormValidator {
  type: string;
  errorMessage: string;
}

export interface CFormField<Values> {
  name: keyof Values & string;
  title: string;
  as: React.ComponentType<FieldProps<any>["field"]> | React.ComponentType;
  required?: boolean;
}

export interface CFormProps<Values> extends CElementProps {
  initialValues: Values;
  onSave?(res: Values): Promise<void>;
  fields: (CFormField<Values> & { [key: string]: any })[];
}

export function CForm<Values>(props: CFormProps<Values>) {
  const handleSubmit = async (
    values: Values,
    { setSubmitting }: FormikHelpers<Values>,
  ) => {
    if (props.onSave) {
      await props.onSave!(values);
      setSubmitting(false);
    } else {
      setSubmitting(false);
    }
  };

  const handleValidation = (values: Values) => {
    const errors: { [key: string]: string } = {};
    for (let i = 0; i < props.fields.length; i++) {
      const { name, required, title } = props.fields[i];
      if (required && !values[name]) {
        errors[name] = `${title} is required`;
      }
    }
    return errors;
  };

  const classes = useStyles();

  return (
    <Formik
      initialValues={props.initialValues}
      validate={handleValidation}
      onSubmit={handleSubmit}
      enableReinitialize={true}
    >
      {({ isSubmitting, errors, dirty }) => (
        <Form className={classes.form}>
          {props.fields.map((field, i) => (
            <FormControl
              key={i}
              required={field.requied}
              error={!!errors[field.name]}
            >
              <Field {...field} />
            </FormControl>
          ))}
          <div>
            <Button
              type="submit"
              id={props.id}
              variant="contained"
              color="primary"
              disabled={!dirty || isSubmitting}
            >
              Save Changes
            </Button>
            <Button
              type="reset"
              id={props.id}
              variant="contained"
              color="default"
              disabled={!dirty || isSubmitting}
            >
              Discard
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
