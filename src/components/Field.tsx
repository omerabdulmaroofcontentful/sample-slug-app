import { useEffect,useState } from 'react';
import { PlainClientAPI } from 'contentful-management';
import { FieldExtensionSDK } from '@contentful/app-sdk';

interface FieldProps {
  sdk: FieldExtensionSDK;
  cma: PlainClientAPI;
}

const Field = (props: FieldProps) => {
  // If you only want to extend Contentful's default editing experience
  // reuse Contentful's editor components
  // -> https://www.contentful.com/developers/docs/extensibility/field-editors/

  const [parentSlug, setParentSlug] = useState('')
  const [slug, setSlug] = useState('')

  useEffect(() => {
    
          //listen to parentReferenceField
    const detachValueChangeHandlerParentSlug = props.sdk.entry.fields.parentPage.onValueChanged(async (value) => {

        if(value){

          //getting the parent entry
          const entry = await props.cma.entry.get({entryId:value.sys.id})
          
          //checking for user email, you can apply your own custom roles here.
          if(props.sdk.user.email === 'omer.abdulmaroof@contentful.com')

            //gettin slug value from parent page.
            setParentSlug(entry.fields.slug['en-US'])
          else {

            //showing alert if the user is not allowed to save slug
            props.sdk.dialogs.openAlert(
              {
                title:'Error Message',
                confirmLabel:'Ok',
                message:'Dear user, You are not allowed to add child Page to this page.'
              })
            setParentSlug('')
            props.sdk.entry.fields.parentPage.removeValue()
          }
        }else{
          setParentSlug('')
        }     
      })
  
    
    const detachValueChangeHandlerTitle = props.sdk.entry.fields.slug.onValueChanged(
      async (value:any) => {
        setSlug(value)
      }
    )

     return () => {
        detachValueChangeHandlerParentSlug()
        detachValueChangeHandlerTitle()
     }
  }, [])

  useEffect(()=>{
    //we want to set the value of the field when ever parent slug or the value of slug changes.
    console.log('Dynamic slug',parentSlug,slug)
    props.sdk.field.setValue(`${parentSlug}/${slug}`)
  },[parentSlug,slug, props.sdk.field])

  return (<div>
            <h4>This field will calculate the Slug Automatically based on the Parent of the page selected</h4>
            <p>............</p>
            {parentSlug}/{slug}
            <p>............</p>
          </div>);
};

export default Field;
