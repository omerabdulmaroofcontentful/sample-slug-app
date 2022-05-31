import { useEffect,useState } from 'react';
import { PlainClientAPI } from 'contentful-management';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { Button } from '@contentful/f36-components';

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
  const [finalSlugValue, setFinalSlugValue] = useState('')

  useEffect(() => {
    
    //called on saving value
    const detachOnMetaChanged = props.sdk.entry.onMetadataChanged(
      async (value:any) => {
        console.log('onSysChanged',value)
        console.log('onSysChanged',finalSlugValue)
        props.sdk.field.setValue(finalSlugValue)
      }
    )
    
    //listen to parentReferenceField
    const detachValueChangeHandlerParentSlug = props.sdk.entry.fields.parentPage.onValueChanged(async (value) => {

      //debugger
      console.log(props.sdk.entry.fields.automatedslug)
          if(value){

            //getting the parent entry
            const entry = await props.cma.entry.get({entryId:value.sys.id})

            //debugger
            //check if page has parent, set slug to autmated else set to normal slug
            if(entry.fields.parentPage == null){
              //gettin slug value from parent page.
              setParentSlug(entry.fields.slug['en-GB'])
            }else{
              //gettin slug value from parent page.
              setParentSlug(entry.fields.automatedslug['en-GB'])

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
        detachOnMetaChanged()
     }
  }, [])

  useEffect(()=>{
     console.log('parent',parentSlug,'child',slug)

    const saveSlugValue = async () => {
      setFinalSlugValue(`${parentSlug}/${slug}`)
      let value =  await props.sdk.field.setValue(`/${parentSlug}/${slug}`)
      console.log('saved slug',value)
    }

    saveSlugValue()
  },[parentSlug,slug])

  const syncButtonClicks = ()=>{

    const getReferenceTree = async () => {
       //get all reference tree and validate it 
      const pageTree = await props.cma.entry.references({entryId:props.sdk.entry.getSys().id})
      const pageTreeArray:any = await pageTree.includes?.Entry
      console.log(typeof pageTree)
      console.log(typeof pageTreeArray)


      //if there is no parent set Parent slug to empty
      if(pageTreeArray == undefined){
        setParentSlug('') 
        return
      }
      
      //debugger
      var updatedSlugValue = ''
      for( const page of pageTreeArray){
        //we only want to get the slug of that page not the parent as parent maybe out of date
        const pageSlug = page.fields.automatedslug["en-GB"].split('/').pop()
        console.log('page',pageSlug)

        if(updatedSlugValue===''){
          updatedSlugValue =`${pageSlug}`
        }else{
          updatedSlugValue = `${pageSlug}/${updatedSlugValue}`
        }
      }

      console.log('updatedSlug',updatedSlugValue)
    
      //update to the latest slug value
      setParentSlug(updatedSlugValue)

    }
    console.log('syncButtonClicks')
    getReferenceTree()
  }

  return (<div>
            <h4>This field will calculate the Slug Automatically based on the Parent of the page selected</h4>
            <p>............</p>
            {finalSlugValue}
            <div>
              <Button onClick={syncButtonClicks}>Sync Slug</Button>
            </div>
          </div>);
};

export default Field;
