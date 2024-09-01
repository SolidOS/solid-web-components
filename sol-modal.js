<div class="sol-modal hidden">
  <div class="modal-header"><button onclick="this.closest('.sol-modal').classList.add('hidden')">X</button></div>
  <div class="modal-body"></div>
</div>
<style>
.sol-modal{
  position:absolute;
  top:0;
  right:0;
  height:fit-content;
  width:fit-content;
  z-index:20000;
  background:#001;
  padding:10rem;
}
.sol-modal.hidden { display:none; }
.modal-header {
  width:100%;
  text-align:right;
}
.modal-header button {
  background-color:#eef !important;
  border:2px solid #eef;
  color:black;
}
.modal-body {
  border:2px solid #eef;
  border-radius:0.2rem;
  width:100%;
  height: calc( 100% - 3rem );
}
</style>
