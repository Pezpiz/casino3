import React, {useEffect} from 'react'
import { useDispatch} from 'react-redux'
import { translate } from '../../../../translations/translate'
import { Button } from 'react-bootstrap'
import { changePopup } from '../../../../reducers/popup'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faRotate, faCarrot} from '@fortawesome/free-solid-svg-icons'
import { draw_dot, getDistance_between_entities, getRoom } from '../../../../utils/games'
import $ from 'jquery'
import { decryptData } from '../../../../utils/crypto'
import { changeRouletteLuckyBet } from '../../../../reducers/games'

function roulette_game(props){
    let self = this	
    let canvas
    let ctx    
	const dispatch = props.dispatch	
	let canvas_width = 900
	let canvas_height = 800

    let start_game = false
    let bet_x = 0
    let bet_square = 0

    let roulette_radius_x = canvas_width/2
	let roulette_radius_y = 250
    let numbers = [] 
	let colors = []
	let startAngle = -1.65
	let startAngle01 = 0
	let arc = 0
	let outsideRadius = 200
	let textRadius = outsideRadius-20
	let insideRadius = outsideRadius-30
    let roulette_pos = []
    let roulette_type = props.page.game.table_type

	let circle = {radius: textRadius*0.6, angle:0}
	let ball = {x:70, y:roulette_radius_x, speed:0.05, width:10}
    let roulette_index = 0
    let win_nr = null

	let font_bold_10 = 'bold 10px sans-serif'
	let font_bold_12 = 'bold 12px sans-serif'
	let font_bold_14 = 'bold 14px sans-serif'

    let spin_clear = [0, 0, 0, 0]
    let radiantLine01 = []
	let radiantLine02 = []
	let radiantLine03 = []
	let text_offset = 0   

    this.ready = function(){
        self.createCanvas(canvas_width, canvas_height)
		self.choose_roulette_type()
        self.start()
    }

    this.createCanvas = function(canvas_width, canvas_height){	
		canvas = document.getElementById("roulette_canvas")	
		ctx = canvas.getContext("2d")
		
		if (window.innerWidth < 960){
			if(window.innerHeight < window.innerWidth){
				//small landscape
				canvas.width = 260
				canvas.height = 300

				roulette_radius_x = 130
				roulette_radius_y = 130
				outsideRadius = 100
				textRadius = outsideRadius-15
				insideRadius = outsideRadius-20

				radiantLine01 = [-65, 15]
				radiantLine02 = [-65, -32]
				radiantLine03 = [-105, -80]
				
				bet_x = 330
				bet_square = 30
			} else {
				//small portrait
				canvas.width = 290
				canvas.height = 300
				roulette_radius_x = 150
				roulette_radius_y = 150
				outsideRadius = 120
				textRadius = outsideRadius-15
				insideRadius = outsideRadius-20

				radiantLine01 = [-65, 15]
				radiantLine02 = [-105, -35]
				radiantLine03 = [-105, -85]
				
				bet_x = 330
				bet_square = 30	
			}
            circle = {radius: textRadius-15, angle:0}
			ball = {x:70, y:roulette_radius_x, speed:0.05, width:6}

			font_bold_10 = 'bold 8px sans-serif'
			font_bold_12 = 'bold 10px sans-serif'
			font_bold_14 = 'bold 12px sans-serif'
			text_offset = 15	
		} else {
			//big
			canvas.width = 900
			canvas.height = 480
			
			roulette_radius_x = canvas_width/2
			roulette_radius_y = 250
			outsideRadius = 200
			textRadius = outsideRadius-20
			insideRadius = outsideRadius-30
			
			circle = {radius: textRadius-22, angle:0}
			ball = {x:70, y:roulette_radius_x, speed:0.05, width:10}
			
			bet_x = canvas.width/2 - 270
			bet_square = 40
			
			font_bold_10 = 'bold 10px sans-serif'
			font_bold_12 = 'bold 12px sans-serif'
			font_bold_14 = 'bold 14px sans-serif'

			radiantLine01 = [-60, 20]
			radiantLine02 = [-60, -160]
			radiantLine03 = [-160, -200]
			text_offset = 25
		}
        canvas_width = canvas.width
		canvas_height = canvas.height	
		canvas.height = canvas_height
		spin_clear = [0, 0, canvas.width, canvas.height]
	}
	
	this.choose_roulette_type = function(){			
		if(roulette_type === 'european'){
			colors = ["green", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red"]
			numbers = ["0", "32", "15", "19", "4", "21", "2", "25", "17", "34", "6", "27", "13", "36", "11", "30", "8", "23", "10", "5", "24", "16", "33", "1", "20", "14", "31", "9", "22", "18", "29", "7", "28", "12", "35", "3", "26"] //37
			arc = Math.PI / (numbers.length/2)		
		} else {
			colors = ["green", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "green", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red", "black", "red"]
			numbers = ["0", "28", "9", "26", "30", "11", "7", "20", "32", "17", "5", "22", "34", "15", "3", "24", "36", "13", "1", "00", "27", "10", "25", "29", "12", "8", "19", "31", "18", "6", "21", "33", "16", "4", "23", "35", "14", "2"] //38
			arc = Math.PI / (numbers.length/2)
		}		
	}

	this.start = function(){			
		ctx.clearRect(0,0, canvas_width, canvas_height)

        ctx.font = font_bold_10
		ctx.shadowColor = "black"
		ctx.shadowOffsetX = 0
		ctx.shadowOffsetY = 0

		self.drawRoulette()	
		ctx.font = font_bold_14
	}

    this.drawRoulette = function(){
        roulette_pos = []
		
		ctx.shadowBlur = 10
		draw_dot(ctx, roulette_radius_x, roulette_radius_y, outsideRadius*1.05, 0, 2 * Math.PI, false, '#a87b51', 15, '#5e391c')	
		draw_dot(ctx, roulette_radius_x, roulette_radius_y, outsideRadius*0.97, 0, 2 * Math.PI, false, 'black', 15, 'black')			
		ctx.shadowBlur = 0

		ctx.font = font_bold_12	
		draw_roulette_holes(outsideRadius, insideRadius, numbers.length, colors, true, startAngle)
		ctx.font = font_bold_14
		draw_roulette_holes(insideRadius-1, insideRadius*0.7, numbers.length, "dark", false, startAngle)
		
		radiantLine(numbers.length, 1, "gold", radiantLine01, startAngle)		
		
		draw_roulette_holes(insideRadius*0.7-1, 0, 12, "grey", false, startAngle01)
		radiantLine(12, 1, "#4d4d4d", radiantLine02, startAngle01)

		draw_roulette_holes(20, 0, 8, "gold", false, startAngle01)	
		radiantLine(8, 1, "#b99813", radiantLine03, startAngle01)
    }

    function draw_roulette_holes(outsideRadius, insideRadius, how_many, colors, text, startAngle){			
		for(let i = 0; i < how_many; i++) {
			arc = Math.PI / (how_many/2)
			let angle = startAngle + i * arc			
		  
			ctx.beginPath()	  
			ctx.arc(roulette_radius_x, roulette_radius_y, outsideRadius, angle, angle + arc, false)   //ctx.arc(x,y,r,sAngle,eAngle,counterclockwise)
			ctx.arc(roulette_radius_x, roulette_radius_y, insideRadius, angle + arc, angle, true)
			
			if(colors === "grey"){
				if(i%2 === 0){
					ctx.fillStyle = "gray"
				} else {
					ctx.fillStyle = "#999"
				}
			} else if(colors === "gold"){
				if(i%2 === 0){
					ctx.fillStyle = "#f0d875"
				} else {
					ctx.fillStyle = "#eac739"
				}		
			} else if(colors === "dark"){
				if(roulette_type === "european"){
					if(i === 0){
						ctx.fillStyle = "darkgreen"
					} else {
						if(i%2 === 0){
							ctx.fillStyle = "black"
						} else {
							ctx.fillStyle = "darkred"
						}
					}
				} else if(roulette_type === "american"){
					if(i === 0 || i === 19){
						ctx.fillStyle = "darkgreen"
					} else {
						if(i%2 === 0){
							ctx.fillStyle = "darkred"
						} else {
							ctx.fillStyle = "black"
						}
					}
				}				
			} else {
				ctx.fillStyle = colors[i]
			}
			
			ctx.fill()
			ctx.save()		 

			if(text){
				ctx.fillStyle = "white"
				ctx.translate(roulette_radius_x + Math.cos(angle + arc / 2) * textRadius, roulette_radius_y + Math.sin(angle + arc / 2) * textRadius)
				ctx.rotate(angle + arc / 2 + Math.PI / 2)
				let text = numbers[i]
				ctx.fillText(text, -ctx.measureText(text).width / 2, 0)
				roulette_pos.push({x: roulette_radius_x + Math.cos(angle + arc / 2) * (textRadius-text_offset), y: roulette_radius_y + Math.sin(angle + arc / 2) * (textRadius-text_offset), nr: text, color: colors[i]})
			}
		  
			ctx.restore()
			ctx.closePath()
		}	
	}
	
	function radiantLine(how_many, line, color, offset, startAngle){
		for(let i = 0; i < how_many; i++) {
			arc = Math.PI / (how_many/2)
			let angle = startAngle + i * arc		
		  
			ctx.beginPath()
			
			ctx.strokeStyle = color
			ctx.lineWidth = line
			ctx.moveTo(roulette_radius_x + Math.cos(angle + arc) * (textRadius+offset[0]), roulette_radius_y + Math.sin(angle + arc) * (textRadius+offset[0]))
			ctx.lineTo(roulette_radius_x + Math.cos(angle + arc) * (textRadius+offset[1]), roulette_radius_y + Math.sin(angle + arc) * (textRadius+offset[1]))
			ctx.stroke()
			ctx.closePath()
		}
	} 

    this.spin = function(data){  
		start_game = true 
		let arc = data.arc	
		
		let spin_nr = 0
		let spin_time = data.spin_time
		let spin_time_more = 200
		//uncomment this to make the spin shorter
		// spin_time = 10
		// spin_time_more = 10

		let monkey = data.monkey
		let monkey_wait = 200

		window.requestAnimFrame = (function(){
			return  window.requestAnimationFrame	||
			window.webkitRequestAnimationFrame		||
			window.mozRequestAnimationFrame			||
			function( callback ){
			  window.setTimeout(callback, 1000 / 60)
			}
	    })()
	  
	    function spin_roulette() {
			if(ctx){
				ctx.clearRect(spin_clear[0], spin_clear[1], spin_clear[2], spin_clear[3])
				let stop = false

				if (spin_nr > spin_time) {
					if(spin_nr > spin_time + spin_time_more){								
						self.drawRoulette()
						ctx.font = font_bold_14
						
						roulette_index = parseInt(self.closest_nr(ball, roulette_pos, "nr"))
						win_nr = roulette_pos[roulette_index]							
						
						self.drawBall(win_nr.x, win_nr.y, ball.width, 0, 2 * Math.PI, false)				
						self.check_win_lose(roulette_bets, win_nr)
						
						setTimeout(function(){ 
							//dispatch(popup_info({title: "Resultat", text: "Numarul norocos este " + win_nr.nr, width: 300, fireworks: false}))
							self.start()
							start_game = false	
						}, 500)
						
						stop = true                    
					} else {
						spin_nr++ 
						self.rotateWheel(arc-0.04)		
						
						roulette_index = parseInt(self.closest_nr(ball, roulette_pos, "nr"))
						win_nr = roulette_pos[roulette_index]
						
						circle.angle -= arc-0.04
						self.rotateBall(win_nr.x, win_nr.y)
						
						stop = false
					}
				} else {
					spin_nr++
					
					switch (true) {
						case (spin_nr <= spin_time/2):						
							self.rotateWheel(arc)
							circle.angle += ball.speed	
							break
						case (spin_nr > spin_time/2 && spin_nr <= 2*spin_time/3):
							self.rotateWheel(arc-0.01)
							circle.angle += ball.speed-0.01	
							break
						case (spin_nr > 2*spin_time/3 && spin_nr <= 5*spin_time/6):
							self.rotateWheel(arc-0.02)
							circle.angle += ball.speed-0.02		
							break
						case (spin_nr > 5*spin_time/6 && spin_nr <= spin_time-20):
							self.rotateWheel(arc-0.03)
							circle.angle += ball.speed-0.03	
							break
						case (spin_nr > spin_time-20 && spin_nr <= spin_time-10):
							self.rotateWheel(arc-0.04)
							circle.angle += ball.speed-0.04	
							break
						default:
							break
					}
					
					if(typeof monkey !== "undefined"){							
						roulette_index = parseInt(self.closest_nr(ball, roulette_pos, "nr"))
						win_nr = roulette_pos[roulette_index]
						
						if(typeof monkey === "number"){
							monkey = monkey.toString()
						}	

						if(monkey === win_nr.nr && spin_nr > spin_time -  monkey_wait){
							self.rotateBall(win_nr.x, win_nr.y)
							spin_nr = spin_time + 1
						} else {
							self.rotateBall(ball.x,ball.y)
						}					
					} else {
						self.rotateBall(ball.x,ball.y)
					}
					
					stop = false
				}		
            
				if(!stop){
					window.requestAnimationFrame(spin_roulette)
				} else {
					window.cancelAnimationFrame(spin_roulette)
				}
			}
	  	}

	  	spin_roulette()  
	}

    this.rotateWheel = function(x) {
		startAngle  = startAngle + x
		startAngle01  = startAngle01 + x
		ball.y = roulette_radius_y + Math.cos(circle.angle) * circle.radius
		ball.x = roulette_radius_x + Math.sin(circle.angle) * circle.radius		
	}	
	
	this.drawBall = function(x, y, r, sAngle, eAngle, counterclockwise){
		draw_dot(ctx, x, y, r, sAngle, eAngle, counterclockwise, 'white', 1, 'grey')  //ctx.arc(x, y, r, sAngle, eAngle, counterclockwise)
	}
	
	this.rotateBall = function(a, b){
		self.drawRoulette()	
		ctx.font = font_bold_14		
		self.drawBall(a, b, ball.width, 0, 2 * Math.PI, false)
	}
	
	this.closest_nr = function(nr, arr, text){
		let closest = 1000
		let obj = {}
		let index = 0
		for(let i in arr){
			if(closest > getDistance_between_entities(nr, arr[i])){
				closest = getDistance_between_entities(nr, arr[i])
				obj = arr[i]
				index = i
			}
		}		
		if(text === "nr"){
			return index
		} else {
			return obj
		}		
	}

    this.check_win_lose = function(x){
		//make a copy of elements
		let elem01 = JSON.parse(JSON.stringify(roulette_bets))
		let elem02 = JSON.parse(JSON.stringify(x))

		dispatch(changeRouletteLuckyBet(elem02))
        let money_history = decryptData(props.user.money)

        for(let i in elem01){		
			if(isNaN(elem01[i].text) === false){
				if(parseInt(elem01[i].text) === parseInt(elem02.nr)){
					//console.log('case-a', elem01[i].text, elem02.nr)
					elem01[i].win = true
					money_history = money_history + elem01[i].bet_value
				} else {
					//console.log('case-b', elem01[i].text, elem02.nr)
					elem01[i].win = false
					money_history = money_history - elem01[i].bet_value
				}
			} else {
				switch (elem01[i].text) {
					case "1st 12":	
						if(elem02.nr > 0 && elem02.nr < 13){
							elem01[i].win = true
							money_history = money_history + elem01[i].bet_value
						} else {
							elem01[i].win = false
							money_history = money_history - elem01[i].bet_value	
						}
						break
					case "2st 12":	
						if(elem02.nr > 12 && elem02.nr < 25){
							elem01[i].win = true
							money_history = money_history + elem01[i].bet_value
						} else {
							elem01[i].win = false
							money_history = money_history - elem01[i].bet_value
						}
						break
					case "3st 12":	
						if(elem02.nr > 24 && elem02.nr < 37){
							elem01[i].win = true
							money_history = money_history + elem01[i].bet_value
						} else {
							elem01[i].win = false
							money_history = money_history - elem01[i].bet_value
						}
						break
					case "1-18":
						if(elem02.nr > 0 && elem02.nr < 19){
							elem01[i].win = true
							money_history = money_history + elem01[i].bet_value
						} else {
							elem01[i].win = false
							money_history = money_history - elem01[i].bet_value
						}
						break
					case "Even":
						if(elem02.nr % 2 === 0){
							elem01[i].win = true
							money_history = money_history + elem01[i].bet_value
						} else {
							elem01[i].win = false
							money_history = money_history - elem01[i].bet_value
						}
						break
					case "reds":
						if(elem02.color === "red"){
							elem01[i].win = true
							money_history = money_history + elem01[i].bet_value
						} else {
							elem01[i].win = false
							money_history = money_history - elem01[i].bet_value
						}
						break
					case "blacks":
						if(elem02.color === "black"){
							elem01[i].win = true
							money_history = money_history + elem01[i].bet_value
						} else {
							elem01[i].win = false
							money_history = money_history - elem01[i].bet_value
						}
						break
					case "Odd":
						if(elem02.nr % 2 !== 0){
							elem01[i].win = true
							money_history = money_history + elem01[i].bet_value
						} else {
							elem01[i].win = false
							money_history = money_history - elem01[i].bet_value
						}
						break
					case "19-36":
						if(elem02.nr > 18 && elem02.nr < 37){
							elem01[i].win = true
							money_history = money_history + elem01[i].bet_value
						} else {
							elem01[i].win = false
							money_history = money_history - elem01[i].bet_value
						}
						break
					case "2 to 1a":						
						for(let k=0; k<12; k++){
							let x = 3*k+3
							if(x === parseInt(elem02.nr)){
								elem01[i].win = true
								money_history = money_history + elem01[i].bet_value
							} else {
								elem01[i].win = true
								money_history = money_history - elem01[i].bet_value
							}							
						}
						break
					case "2 to 1b":
						for(let k=0; k<12; k++){
							let x = 3*k+2
							if(x === parseInt(elem02.nr)){
								elem01[i].win = true
								money_history = money_history + elem01[i].bet_value
							} else {
								elem01[i].win = true
								money_history = money_history - elem01[i].bet_value
							}							
						}
						break
					case "2 to 1c":
						for(let k=0; k<12; k++){
							let x = 3*k+1
							if(x === parseInt(elem02.nr)){
								elem01[i].win = true
								money_history = money_history + elem01[i].bet_value
							} else {
								elem01[i].win = true
								money_history = money_history - elem01[i].bet_value
							}							
						}
						break
					default:
						break
				}
			}
			elem01[i].money_history = money_history
		}	
        self.win_lose(elem01, money_history)
    }

    this.win_lose = function(arr, money_history, leave=false){
		let game = null
		if(props.page && props.page.game){
			game = props.page.game
		}
		let status = "lose"
		let money_original = decryptData(props.user.money)
		if(!leave && money_original < money_history){
			status = "win"
		}		
		let roulette_payload = {
			uuid: props.user.uuid,
			game: game,
			money: money_history,
			status: status,
			bet: Math.abs(money_original - money_history)
		}
		if(typeof props.results === "function"){
            props.results(roulette_payload)
        }			
    }

    this.get_status_game = function(){
        return start_game
    }

	this.leave = function(){
		let elem01 = JSON.parse(JSON.stringify(roulette_bets))
		let money_history = decryptData(props.user.money)
		for(let i in elem01){
			elem01[i].win = false
			money_history = money_history - elem01[i].bet_value
			elem01[i].money_history = money_history
		}
		self.win_lose(elem01, money_history, true)		
	}
}

var roulette_bets = []
function RouletteGame(props){
    let dispatch = useDispatch()	
    let options = {...props, dispatch}
    let my_roulette = new roulette_game(options)
	roulette_bets = props.bets

	function ready(){
		if(my_roulette && document.getElementById("roulette_canvas")){
            my_roulette.ready()
        }
	}

    useEffect(() => {
        ready()
        $(window).resize(function(){
			ready()
		})
		return () => {
			if(my_roulette){
				my_roulette.leave()// if the user leaves the game, if he bet, he will lose the bets
				my_roulette = null
			}
		}
    }, [])

	useEffect(() => {
		props.socket.on('roulette_read', function(data){
			if(typeof data.arc !== "undefined" || typeof data.spin_time !== "undefined" || typeof data.ball_speed !== "undefined"){
				if (window.innerWidth < 960){
					if(window.innerHeight < window.innerWidth){
						//landscape
						data.speed = 0.0173
					} else {
						//portrait
						data.speed = 0.018
					}					
				} 
				if(my_roulette && document.getElementById("roulette_canvas")){
					my_roulette.spin(data)
				}
			}				
		})	
    }, [props.socket])

    function openTable(){
        if(my_roulette){
            let status = my_roulette.get_status_game()
			let money = decryptData(props.user.money)
            if(!status && money && money>0){
                props.openTable()
            } else {
				let payload = {
					open: true,
					template: "error",
					title: translate({lang: props.lang, info: "error"}),
					data: translate({lang: props.lang, info: "no_money"})
				}
				dispatch(changePopup(payload))
            } 
        }
    }

    function gameStart(){
        if(my_roulette && document.getElementById("roulette_canvas") && roulette_bets && roulette_bets.length>0){
			let roulette_payload_server = {
				uuid: props.user.uuid,
				room: getRoom(props.page.game),
				bet: roulette_bets,
			}
			props.socket.emit('roulette_send', roulette_payload_server)
		} else {
			let payload = {
				open: true,
				template: "error",
				title: translate({lang: props.lang, info: "error"}),
				data: translate({lang: props.lang, info: "no_bets"})
			}
			dispatch(changePopup(payload))
		}
    }

    return <div className="roulette_container">
        <canvas id="roulette_canvas"></canvas>
        <div className="game_start">
            <Button 
                type="button"  
                className="mybutton round button_transparent shadow_convex"
                onClick={()=>gameStart()}
            ><FontAwesomeIcon icon={faRotate} /></Button>
            <Button 
                type="button"  
                className="mybutton round button_transparent shadow_convex"
                onClick={()=>openTable()}
            ><FontAwesomeIcon icon={faCarrot} /></Button>
        </div>
    </div>
}

export default RouletteGame