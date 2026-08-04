
import img1 from '../assets/card4.jpg'
import img2 from '../assets/card5.jpg'
import img3 from '../assets/card6.jpg'
import img4 from '../assets/card7.jpg'

function PrincipalPage() {
  return (
<>
    <div className="min-h-screen font-serif overflow-x-hidden ">

      <section className="flex flex-col h-screen text-white p-2 bg-black/40 bg-[url(./assets/found1.jpg)] bg-cover bg-no-repeat bg-blend-multiply">

        <nav className="flex  justify-between items-center px-10 ">

          <div className="flex items-center gap-2">
            <span className=" flex ">
            <img src="/logo.png" alt="" className="h-18 w-auto cover" />
            
            </span>
            <h1 className="uppercase font-bold tracking-widest">titulo</h1>

          </div>

          <div className="hidden md:flex  items-center gap-10 text-gray-300">
            <a href="" className=" uppercase text-xs">Home</a>
            <a href="" className=" uppercase text-xs">pages</a>
            <a href="" className=" uppercase text-xs">shop</a>
            <a href="" className=" uppercase text-xs">blog</a>
            <a href="" className=" uppercase text-xs">elements</a>


          </div>
        </nav>

        <div className="flex flex-col gap-8 items-center justify-center text-center grow  ">
          <h1 className="uppercase text-5xl tracking-widest mb-10">AGE OF THE FIREFLY</h1>
          <p className="text-sm max-w-xl text-gray-300">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quisquam excepturi labore 
            ipsam? Autem ipsam aut voluptatem magnam unde delectus eaque, ratione adipisci laudantium,
             illo consectetur natus. Reprehenderit
          </p>
          <a href="" className=" uppercase text-gray-300 font-extralight text-sm border-2 py-2 px-6">buy teheme</a>



        </div>



      </section >


      <section className="flex flex-col h-[50vh]  p-2 text-white bg-black/40 bg-[url(./assets/found2.jpg)] bg-cover bg-no-repeat bg-top-right bg-blend-multiply">
        <div className="flex flex-col gap-6 items-center justify-center text-center grow">
          <p className="text-sm text-gray-300 ">come the end of the world</p>
          <h1 className=" uppercase text-2xl">see whats lies beyond</h1>
          <p className="text-sm max-w-xl text-gray-300 ">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Odit recusandae soluta praesentium accusamus earum porro ullam labore.
             Eos maxime laborum animi earum, id sit. Illum molestias obcaecati
              laudantium eaque necessitatibus.
          </p>



        </div>

        
      </section>

      <section className="flex h-screen bg-[url(./assets/found3.jpg)] bg-cover bg-no-repeat bg-top-right">

      </section>

      <section className="flex flex-col gap-10 justify-center items-center py-5 min-h-screen text-white bg-black/70 bg-[url(./assets/found4.jpg)] bg-cover bg-no-repeat bg-center-left bg-blend-multiply">

        <div className=" flex flex-col justify-center gap-2 items-center text-center  ">
          <p className="text-sm">theread thain path</p>
          <h1 className="uppercase text-2xl tracking-widest mb-10">with a carefull sept</h1>
          <p className="text-sm max-w-xl">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Incidunt aut tenetur 
            assumenda magni eos quos excepturi vitae, perspiciatis quaerat repudiandae recusandae, hic quisquam 
            iusto ullam corporis error unde maxime cum!
          </p>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8   p-10 max-w-7xl">

          <div className="flex flex-col  ">
            <div className="h-56  w-full bg-[url(./assets/card1.jpg)] bg-cover bg-top "></div>
            <div className="flex flex-col p-4 gap-3 text-center items-center justify-center">

            <h1 className="text-xl">dragon slayer</h1>
            <p className="text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto omnis deserun
              t officiis labore eligendi sunt, ducimus,  repellat ex tenetur
               cupiditate?
            </p>


            </div>

          </div>
            <div className="flex flex-col ">
            <div className="h-56  w-full bg-[url(./assets/card2.jpg)] bg-cover bg-top "></div>
            <div className="flex flex-col p-4 gap-3 text-center items-center justify-center">

            <h1 className="text-xl">dragon slayer</h1>
            <p className="text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto omnis deserun
              t officiis labore eligendi sunt, ducimus,  repellat ex tenetur
               cupiditate?
            </p>


            </div>

          </div>
                    <div className="flex flex-col  ">
            <div className="h-56  w-full bg-[url(./assets/card3.jpg)] bg-cover bg-top  "></div>
            <div className="flex flex-col p-4 gap-3 text-center items-center justify-center">

            <h1 className="text-xl">dragon slayer</h1>
            <p className="text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto omnis deserun
              t officiis labore eligendi sunt, ducimus,  repellat ex tenetur
               cupiditate?
            </p>


            </div>

          </div>

        </div>
        
      </section>

      <section className="flex flex-col p-5 justify-center items-center min-h-screen   bg-black/60 bg-[url(./assets/found5.jpg)] bg-cover bg-no-repeat bg-center bg-blend-multiply">

        <div className="grid grid-cols-1 md:grid-cols-2  gap-4 justify-between items-center p-2 max-w-4/5 ">

          <div className=" ">
            <img src={img1} alt="" className="h-80 w-full object-cover"/>
          </div>

          <div className="  ">
            <img src={img2} alt="" className="h-80 w-full object-cover"/>
          </div>

          <div className=" ">
            <img src={img3} alt="" className="h-80 w-full object-cover"/>
          </div>

          <div className="  ">
            <img src={img4} alt="" className="h-80 w-full object-cover"/>
          </div>



        </div>


      </section>






      <section className='min-h-screen flex flex-col justify-center items-center p-5 gap-4 text-white bg-linear-to-bl from-black to-gray-700'>

        <div className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,500px),1fr))] w-full  gap-3 p-10'>
          <div className=''> 
            
            <h2 className='uppercase text-xl font-bold'>titulo</h2>
          
          </div>

          <div className=''>
            <p className='font-extrabold text-2xl'> Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero quam similique nemo illo nisi. Debitis nam labore laboriosam animi doloremque. 
            </p>


          </div>

          <div className=''>

            <p className='text-sm'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Atque molestias cum aliquam architecto nulla saepe rem? Nobis aliquid nostrum consequatur sint sunt, autem dolorem laboriosam ratione aut quidem iusto itaque quasi ipsum magnam fugit exercitationem dolores. Perspiciatis quaerat odio eum!</p>


          </div>

          <div className=''>

          </div>





        </div>




        <div className=' grid grid-cols-2 md:grid-cols-5    auto-rows-[150px] md:auto-rows-[300px] w-full  gap-6 px-5 py-10 ' >

          <div className='md:row-span-2 col-span-2  bg-[url(./assets/card1.jpg)] bg-cover bg-center'></div>
          <div className='  bg-[url(./assets/card5.jpg)] bg-cover bg-center'></div>
          <div className='  bg-[url(./assets/card2.jpg)] bg-cover bg-center'> </div>
          <div className='  bg-[url(./assets/card7.jpg)] bg-cover bg-center'> </div>
          <div className='  bg-[url(./assets/card3.jpg)] bg-cover bg-center'></div>

        </div>






      </section>







    </div>


    </>
  )
}

export default PrincipalPage
