// @ts-nocheck
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Formik } from "formik";
import { useConfirmationModalContext } from "../contexts/ConfirmationModalContext";
import { useMessageContext } from "../contexts/ChatContext";

type FormikErrorValues = Record<string, string | undefined>;

export default function ConfirmationModal() {
  const [open, setOpen] = useState(true);
  const [disabled, setDisabled] = useState(true);

  const { saveConfirmationToAirtable, interviewConfirmed } =
    useConfirmationModalContext();

  const { sessionData } = useMessageContext();

  const [formValues, setFormValues] = useState({
    privacyPolicy: false,
    consent: false,
  });

  useEffect(() => {
    if (interviewConfirmed) {
      sessionStorage.setItem("interview_confirmed", "true");
      setOpen(false);
    }
  }, [interviewConfirmed]);

  useEffect(() => {
    if (formValues.privacyPolicy && formValues.consent) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [formValues.privacyPolicy, formValues.consent]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => console.log("closing")}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:p-6 max-w-[35rem] h-[35rem]">
                <Formik
                  initialValues={{
                    fullname: "",
                    email: "",
                    phoneNumber: "",
                    privacyPolicy: false,
                    consent: false,
                  }}
                  validate={(values) => {
                    const errors: FormikErrorValues = {};

                    if (!values.privacyPolicy) {
                      errors.privacyPolicy = "Privacy policy is required.";
                    }

                    if (!values.consent) {
                      errors.consent = "Consent is required.";
                    }
                  }}
                  onSubmit={async (values) => {
                    // console.log(values);
                    if (values.privacyPolicy && values.consent) {
                      saveConfirmationToAirtable({
                        fullName: values.fullname,
                        email: values.email,
                        phoneNumber: values.phoneNumber,
                        confirmation: values.privacyPolicy,
                        consent: values.consent,
                      });
                    }
                  }}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                  }) => {
                    useEffect(() => {
                      if (values.privacyPolicy && values.consent) {
                        setDisabled(false);
                      } else {
                        setDisabled(true);
                      }
                    }, [values.privacyPolicy, values.consent]);

                    return (
                      <form onSubmit={handleSubmit}>
                        <div>
                          <div className="flex flex-col justify-start ">
                            <div className="text-[18px]">
                              User interview for{" "}
                              {sessionData && sessionData.fields
                                ? sessionData.fields["StudyName"]
                                : "study"}
                            </div>
                            <div className="mt-2 text-gray-500 text-sm">
                              Should take less than 5 minutes
                            </div>
                            <div className="border solid"></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="mb-2 mt-2 text-sm">
                              Before we start, please enter your name, email
                              address and phone number
                            </span>
                            <label
                              htmlFor="fullname"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Full name
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="fullname"
                                id="fullname"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="John Doe"
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium leading-6 text-gray-900 mt-2"
                            >
                              Email
                            </label>
                            <div className="mt-2">
                              <input
                                type="email"
                                name="email"
                                id="email"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="you@example.com"
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </div>
                            <label
                              htmlFor="phone-number"
                              className="block text-sm font-medium leading-6 text-gray-900 mt-2"
                            >
                              Phone number
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="phoneNumber"
                                id="phoneNumber"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="+44 7658293443"
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex">
                            <input
                              id="privacy-policy"
                              aria-describedby="privacy-policy-description"
                              name="privacyPolicy"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 relative top-[0.2rem] mr-2"
                              onChange={handleChange}
                              checked={values.privacyPolicy}
                            />
                            <label
                              htmlFor="privacy-policy"
                              className="font-medium text-gray-900"
                            >
                              I have read and agree to Parroviews's
                              <a
                                href="https://parroview-documents.s3.eu-west-2.amazonaws.com/privacy_policy_for_participants_revised.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline ml-1 mr-1"
                              >
                                privacy policy for interview participants
                              </a>
                            </label>
                          </div>

                          <div className="flex h-6 mt-2">
                            <input
                              id="consent"
                              aria-describedby="consent-description"
                              name="consent"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 relative top-[0.2rem] mr-2"
                              onChange={handleChange}
                              checked={values.consent}
                            />
                            <label
                              htmlFor="consent"
                              className="font-medium text-gray-900"
                            >
                              I consent to the transcription of this interview
                              and allow the interviewer to use it for any
                              internal purposes
                            </label>
                          </div>
                          <div className="flex flex-col place-self-center mt-8 items-end">
                            <button
                              type="submit"
                              disabled={disabled}
                              className={`rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 max-w-[10rem] ${
                                disabled && "opacity-50 cursor-not-allowed"
                              })}`}
                            >
                              Continue
                            </button>
                          </div>
                        </div>
                      </form>
                    );
                  }}
                </Formik>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
