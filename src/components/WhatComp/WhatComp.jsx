import React from "react";
import "./WhatComp.css"
import { Feature } from "../../components";
import { WhatfeatureData } from "../../data/FeaturesData";

const WhatComp = () => {
  return (
    <div className="signlang__whatsignlang section__margin" id="whatsignlang">
      <div className="signlang__whatsignlang-feature">
        <Feature
          title="¿Qué es el Lenguaje de Señas?"
          text="El Lenguaje de Señas es una lengua visual que utiliza movimientos de las manos, expresiones faciales y posturas corporales para comunicarse. Está reconocido oficialmente en muchos países y es utilizado principalmente por personas sordas o con pérdida auditiva, aunque todos podemos aprenderlo para construir una comunicación más inclusiva."
        />
      </div>

      <div className="signlang__whatsignlang-container">
        {
          WhatfeatureData.map((data,i)=>(
            <Feature title={data.title} text={data.text} key={i*201}/>
          ))
        }
        
      </div>
    </div>
  );
};

export default WhatComp;
